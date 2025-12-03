import OpenAI from "openai";
import { injectable } from "tsyringe";
import {
  QueryAnalysis,
  QueryAnalyzerPort,
  QueryType,
} from "../ports/query-analyzer.port";

const SCHEMA_DESCRIPTION = `
Ticket Schema:
- id: string (unique identifier)
- text: string (full ticket description)
- metadata: object with fields like:
  - priority: string (e.g., "high", "medium", "low")
  - status: string (e.g., "open", "closed", "in-progress")
  - category: string (e.g., "vpn", "network", "hardware", "software")
  - created_at: timestamp
  - resolved_at: timestamp
  - assignee: string
  - ticket_number: string
  - severity: number (1-5)
  - department: string
  
Available aggregate functions: COUNT, AVG, SUM, MIN, MAX
Available date functions: DATE, WEEK, MONTH, YEAR
`;

@injectable()
export class OpenAIQueryAnalyzer implements QueryAnalyzerPort {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyze(query: string, availableKBs: string[]): Promise<QueryAnalysis> {
    const systemPrompt = `You are a query analyzer for a hybrid RAG system over IT ticketing data.

${SCHEMA_DESCRIPTION}

Analyze user queries and determine:
1. Query Type:
   - SEMANTIC: Questions about "why", "what", "how" that need understanding of ticket content
   - QUANTITATIVE: Questions about counts, statistics, aggregations ("how many", "average", etc.)
   - HYBRID: Questions that need both semantic understanding AND quantitative data

2. For QUANTITATIVE or HYBRID queries, generate SQL queries that:
   - Use simplified SQL syntax (SELECT fields, COUNT, WHERE, GROUP BY, ORDER BY)
   - Query against a "tickets" table with metadata fields
   - Filter by metadata.field_name for metadata fields
   - Use proper date filtering for time-based queries
   - Return meaningful aggregations

3. For SEMANTIC or HYBRID queries:
   - Extract the core semantic question
   - Suggest topK (typically 5-20 based on question scope)

Return ONLY valid JSON with this structure:
{
  "queryType": "semantic" | "quantitative" | "hybrid",
  "intent": "brief description of what user wants",
  "needsVectorSearch": boolean,
  "needsSQLQuery": boolean,
  "sqlQuery": "generated SQL or null",
  "vectorSearchQuery": "semantic query or null",
  "topK": number or null
}`;

    const userPrompt = `Analyze this query: "${query}"

Available knowledge bases: ${availableKBs.join(", ")}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    const parsed = JSON.parse(content);

    return {
      queryType: parsed.queryType as QueryType,
      intent: parsed.intent,
      needsVectorSearch: parsed.needsVectorSearch,
      needsSQLQuery: parsed.needsSQLQuery,
      sqlQuery: parsed.sqlQuery || undefined,
      vectorSearchQuery: parsed.vectorSearchQuery || undefined,
      topK: parsed.topK || undefined,
    };
  }
}
