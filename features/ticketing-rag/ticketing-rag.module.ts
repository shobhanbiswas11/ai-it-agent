import { container } from "tsyringe";
import { CSVParserAdapter } from "./infra/csv-parser.adapter";
import { LlamaIndexVectorStoreAdapter } from "./infra/llamaindex-vector-store.adapter";
import { OpenAIQueryAnalyzer } from "./infra/openai-query-analyzer.adapter";
import { CSVParserPort } from "./ports/csv-parser.port";
import { QueryAnalyzerPort } from "./ports/query-analyzer.port";
import { TicketRepositoryPort } from "./ports/ticket.repository.port";
import { VectorStorePort } from "./ports/vector-store.port";
import { KBRepository } from "./repos/kb.repo";
import { SQLiteTicketRepository } from "./repos/ticket.repo";
import { CreateKnowledgeBase } from "./use-cases/create-kb.usecase";
import { QueryKnowledgeBase } from "./use-cases/query-kb.usecase";

/**
 * Register ticketing-rag module dependencies
 * Following DDD and Hexagonal Architecture principles
 */
export function registerTicketingRAGModule() {
  // Repositories
  container.registerSingleton(KBRepository);
  container.registerSingleton<TicketRepositoryPort>(
    "TicketRepositoryPort",
    SQLiteTicketRepository
  );

  // Infrastructure adapters
  container.registerSingleton<VectorStorePort>(
    "VectorStorePort",
    LlamaIndexVectorStoreAdapter
  );
  container.registerSingleton<CSVParserPort>("CSVParserPort", CSVParserAdapter);
  container.registerSingleton<QueryAnalyzerPort>(
    "QueryAnalyzerPort",
    OpenAIQueryAnalyzer
  );

  // Use cases
  container.register(CreateKnowledgeBase, {
    useFactory: (c) => {
      return new CreateKnowledgeBase(
        c.resolve(KBRepository),
        c.resolve<CSVParserPort>("CSVParserPort"),
        c.resolve<VectorStorePort>("VectorStorePort"),
        c.resolve<TicketRepositoryPort>("TicketRepositoryPort")
      );
    },
  });

  container.register(QueryKnowledgeBase, {
    useFactory: (c) => {
      return new QueryKnowledgeBase(
        c.resolve(KBRepository),
        c.resolve<VectorStorePort>("VectorStorePort"),
        c.resolve<TicketRepositoryPort>("TicketRepositoryPort"),
        c.resolve<QueryAnalyzerPort>("QueryAnalyzerPort")
      );
    },
  });

  console.log("✓ Ticketing RAG module registered");
}
