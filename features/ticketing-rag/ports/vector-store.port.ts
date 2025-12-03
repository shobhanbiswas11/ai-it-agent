import { Ticket } from "../domain/ticket.entity";

export interface VectorDocument {
  id: string;
  text: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

/**
 * Port for vector storage operations
 * Abstracts the vector database implementation
 */
export interface VectorStorePort {
  /**
   * Store tickets as vectors in the knowledge base
   * @param kbId - Knowledge base identifier
   * @param tickets - Tickets to vectorize and store
   */
  storeTickets(kbId: string, tickets: Ticket[]): Promise<void>;

  /**
   * Query vectors by semantic similarity
   * @param kbIds - Knowledge base identifiers to search in
   * @param query - Natural language query
   * @param topK - Number of results to return
   */
  query(
    kbIds: string[],
    query: string,
    topK?: number
  ): Promise<VectorDocument[]>;

  /**
   * Delete all vectors for a knowledge base
   * @param kbId - Knowledge base identifier
   */
  deleteKnowledgeBase(kbId: string): Promise<void>;

  /**
   * Get storage path for a knowledge base
   * @param kbId - Knowledge base identifier
   */
  getStoragePath(kbId: string): string;
}
