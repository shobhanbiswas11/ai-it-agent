import { Ticket } from "../domain/ticket.entity";

export interface TicketFilter {
  kbId?: string;
  ids?: string[];
  metadata?: Record<string, any>;
}

export interface TicketQueryResult {
  tickets: Ticket[];
  total: number;
  aggregations?: Record<string, any>;
}

export interface SQLQueryResult {
  rows: any[];
  rowCount: number;
  fields?: string[];
}

/**
 * Port for structured ticket storage (SQL database)
 * Stores ticket metadata and structured fields for quantitative queries
 */
export interface TicketRepositoryPort {
  /**
   * Save tickets to the database
   * @param kbId - Knowledge base identifier
   * @param tickets - Tickets to save
   */
  saveTickets(kbId: string, tickets: Ticket[]): Promise<void>;

  /**
   * Find tickets by filter criteria
   * @param filter - Filter criteria
   */
  findTickets(filter: TicketFilter): Promise<Ticket[]>;

  /**
   * Query tickets with aggregations (for quantitative analysis)
   * @param kbId - Knowledge base identifier
   * @param aggregationQuery - Aggregation configuration
   */
  queryWithAggregations(
    kbId: string,
    aggregationQuery: Record<string, any>
  ): Promise<TicketQueryResult>;

  /**
   * Execute raw SQL query (LLM-generated)
   * @param sqlQuery - SQL query string
   * @param kbIds - Knowledge base identifiers to query
   */
  executeSQLQuery(sqlQuery: string, kbIds: string[]): Promise<SQLQueryResult>;

  /**
   * Delete all tickets for a knowledge base
   * @param kbId - Knowledge base identifier
   */
  deleteByKnowledgeBase(kbId: string): Promise<void>;

  /**
   * Count tickets by knowledge base
   * @param kbId - Knowledge base identifier
   */
  countByKnowledgeBase(kbId: string): Promise<number>;
}
