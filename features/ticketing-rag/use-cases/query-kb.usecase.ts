import { injectable } from "tsyringe";
import { Ticket } from "../domain/ticket.entity";
import { QueryKBDto } from "../dtos/query-kb.dto";
import { QueryAnalyzerPort, QueryType } from "../ports/query-analyzer.port";
import {
  SQLQueryResult,
  TicketRepositoryPort,
} from "../ports/ticket.repository.port";
import { VectorStorePort } from "../ports/vector-store.port";
import { KBRepository } from "../repos/kb.repo";

export interface SemanticResult {
  ticket: Ticket;
  similarityScore: number;
  relevantText: string;
}

export interface QuantitativeResult {
  sqlQuery: string;
  data: any[];
  summary: string;
}

export interface HybridQueryResult {
  queryType: QueryType;
  intent: string;
  semantic?: SemanticResult[];
  quantitative?: QuantitativeResult;
  knowledgeBasesQueried: string[];
  originalQuery: string;
  answer: string; // LLM-formatted natural language answer
}

/**
 * Use case: Intelligent hybrid RAG query
 *
 * LLM analyzes the query and decides:
 * 1. Semantic questions → Vector search (e.g., "Why were VPN issues high?")
 * 2. Quantitative questions → SQL generation (e.g., "How many high priority tickets?")
 * 3. Hybrid questions → Both approaches combined
 */
@injectable()
export class QueryKnowledgeBase {
  constructor(
    private _kbRepo: KBRepository,
    private _vectorStore: VectorStorePort,
    private _ticketRepo: TicketRepositoryPort,
    private _queryAnalyzer: QueryAnalyzerPort
  ) {}

  async execute(props: QueryKBDto): Promise<HybridQueryResult> {
    // Validate KBs exist
    const kbs = await this._kbRepo.findByIds(props.knowledgeBaseIds);
    if (kbs.length === 0) {
      throw new Error("No valid knowledge bases found");
    }

    const activeKbIds = kbs
      .filter((kb) => kb.status === "active")
      .map((kb) => kb.id);

    if (activeKbIds.length === 0) {
      throw new Error("No active knowledge bases found");
    }

    // Step 1: LLM analyzes the query
    const analysis = await this._queryAnalyzer.analyze(
      props.query,
      activeKbIds
    );

    console.log("Query Analysis:", {
      type: analysis.queryType,
      intent: analysis.intent,
      needsVector: analysis.needsVectorSearch,
      needsSQL: analysis.needsSQLQuery,
    });

    let semanticResults: SemanticResult[] | undefined;
    let quantitativeResult: QuantitativeResult | undefined;

    // Step 2: Execute vector search if needed
    if (analysis.needsVectorSearch && analysis.vectorSearchQuery) {
      const topK = analysis.topK || props.topK || 10;

      const vectorResults = await this._vectorStore.query(
        activeKbIds,
        analysis.vectorSearchQuery,
        topK
      );

      // Enrich with full ticket data
      const ticketIds = vectorResults.map((r) => r.id);
      const tickets = await this._ticketRepo.findTickets({ ids: ticketIds });
      const ticketMap = new Map(tickets.map((t) => [t.id, t]));

      semanticResults = vectorResults
        .map((result) => {
          const ticket = ticketMap.get(result.id);
          if (!ticket) return null;

          return {
            ticket,
            similarityScore: (result as any).score || 0,
            relevantText: result.text,
          };
        })
        .filter((r): r is SemanticResult => r !== null);
    }

    // Step 3: Execute SQL query if needed
    if (analysis.needsSQLQuery && analysis.sqlQuery) {
      const sqlResult = await this._ticketRepo.executeSQLQuery(
        analysis.sqlQuery,
        activeKbIds
      );

      quantitativeResult = {
        sqlQuery: analysis.sqlQuery,
        data: sqlResult.rows,
        summary: this.formatSQLResult(sqlResult),
      };
    }

    // Step 4: Format final answer
    const answer = this.formatAnswer(
      analysis.queryType,
      analysis.intent,
      semanticResults,
      quantitativeResult
    );

    return {
      queryType: analysis.queryType,
      intent: analysis.intent,
      semantic: semanticResults,
      quantitative: quantitativeResult,
      knowledgeBasesQueried: activeKbIds,
      originalQuery: props.query,
      answer,
    };
  }

  private formatSQLResult(result: SQLQueryResult): string {
    if (result.rowCount === 0) {
      return "No results found.";
    }

    if (result.rowCount === 1 && result.rows[0].count !== undefined) {
      return `Count: ${result.rows[0].count}`;
    }

    if (result.rows[0] && Object.keys(result.rows[0]).length === 1) {
      const value = Object.values(result.rows[0])[0];
      return `Result: ${value}`;
    }

    return `Found ${result.rowCount} result(s)`;
  }

  private formatAnswer(
    queryType: QueryType,
    intent: string,
    semantic?: SemanticResult[],
    quantitative?: QuantitativeResult
  ): string {
    let answer = "";

    if (queryType === QueryType.SEMANTIC && semantic) {
      answer = `Found ${semantic.length} relevant tickets:\n\n`;
      semantic.slice(0, 3).forEach((result, idx) => {
        answer += `${idx + 1}. ${result.relevantText.substring(0, 200)}...\n`;
        answer += `   (Relevance: ${(result.similarityScore * 100).toFixed(
          1
        )}%)\n\n`;
      });
    } else if (queryType === QueryType.QUANTITATIVE && quantitative) {
      answer = `${quantitative.summary}\n\n`;
      if (quantitative.data.length > 0 && quantitative.data.length <= 10) {
        answer += "Details:\n";
        quantitative.data.forEach((row) => {
          answer += `${JSON.stringify(row)}\n`;
        });
      }
    } else if (queryType === QueryType.HYBRID && semantic && quantitative) {
      answer = `Quantitative: ${quantitative.summary}\n\n`;
      answer += `Semantic insights (${semantic.length} tickets found):\n`;
      semantic.slice(0, 2).forEach((result, idx) => {
        answer += `${idx + 1}. ${result.relevantText.substring(0, 150)}...\n`;
      });
    }

    return answer || "No results found.";
  }
}
