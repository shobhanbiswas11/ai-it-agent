import { OpenAIEmbedding } from "@llamaindex/openai";
import * as fs from "fs/promises";
import {
  Document,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import * as path from "path";
import { injectable } from "tsyringe";
import { Ticket } from "../domain/ticket.entity";
import { VectorDocument, VectorStorePort } from "../ports/vector-store.port";

/**
 * LlamaIndex adapter for vector storage
 * Stores vectors on disk for persistence
 */
@injectable()
export class LlamaIndexVectorStoreAdapter implements VectorStorePort {
  private readonly basePath: string;
  private indices: Map<string, VectorStoreIndex> = new Map();

  constructor() {
    // Configure storage path - can be injected via config
    this.basePath = process.env.VECTOR_STORE_PATH || "./data/vector-store";

    // Configure LlamaIndex settings
    Settings.embedModel = new OpenAIEmbedding({
      model: "text-embedding-3-small",
      dimensions: 1536,
    });
  }

  async storeTickets(kbId: string, tickets: Ticket[]): Promise<void> {
    const storagePath = this.getStoragePath(kbId);

    // Ensure directory exists
    await fs.mkdir(storagePath, { recursive: true });

    // Convert tickets to LlamaIndex documents
    const documents = tickets.map(
      (ticket) =>
        new Document({
          text: ticket.text,
          id_: ticket.id,
          metadata: {
            ...ticket.metadata,
            kbId,
            ticketId: ticket.id,
          },
        })
    );

    // Create storage context for disk persistence
    const storageContext = await storageContextFromDefaults({
      persistDir: storagePath,
    });

    // Create or update index
    const index = await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });

    // Store in memory for quick access
    this.indices.set(kbId, index);

    console.log(
      `Stored ${tickets.length} tickets in KB ${kbId} at ${storagePath}`
    );
  }

  async query(
    kbIds: string[],
    query: string,
    topK: number = 10
  ): Promise<VectorDocument[]> {
    const allResults: VectorDocument[] = [];

    for (const kbId of kbIds) {
      const index = await this.getOrLoadIndex(kbId);
      if (!index) continue;

      // Create query engine
      const queryEngine = index.asQueryEngine({
        similarityTopK: topK,
      });

      // Execute query
      const response = await queryEngine.query({
        query,
      });

      // Extract source nodes (documents with scores)
      const sourceNodes = response.sourceNodes || [];

      const results = sourceNodes.map((node) => {
        // Extract text content from node
        const textContent = String(
          (node.node as any).text || node.node.id_ || ""
        );

        return {
          id: node.node.id_,
          text: textContent,
          metadata: node.node.metadata,
          score: node.score,
        };
      });

      allResults.push(...results);
    }

    // Sort by score and return top K across all KBs
    return allResults
      .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);
  }

  async deleteKnowledgeBase(kbId: string): Promise<void> {
    const storagePath = this.getStoragePath(kbId);

    // Remove from memory
    this.indices.delete(kbId);

    // Delete from disk
    try {
      await fs.rm(storagePath, { recursive: true, force: true });
      console.log(`Deleted KB ${kbId} from ${storagePath}`);
    } catch (error) {
      console.error(`Failed to delete KB ${kbId}:`, error);
      throw error;
    }
  }

  getStoragePath(kbId: string): string {
    return path.join(this.basePath, kbId);
  }

  /**
   * Load index from disk or return cached version
   */
  private async getOrLoadIndex(kbId: string): Promise<VectorStoreIndex | null> {
    // Return cached index
    if (this.indices.has(kbId)) {
      return this.indices.get(kbId)!;
    }

    const storagePath = this.getStoragePath(kbId);

    // Check if storage exists
    try {
      await fs.access(storagePath);
    } catch {
      console.warn(`No vector store found for KB ${kbId}`);
      return null;
    }

    // Load from disk
    const storageContext = await storageContextFromDefaults({
      persistDir: storagePath,
    });

    const index = await VectorStoreIndex.init({
      storageContext,
    });

    this.indices.set(kbId, index);
    return index;
  }
}
