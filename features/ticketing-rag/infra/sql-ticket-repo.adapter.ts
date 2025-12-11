import Database from "better-sqlite3";
import { ChromaClient } from "chromadb";
import { Ticket } from "../domain/entities/ticket.entity";
import { QueryFilter, TicketRepoPort } from "../ports/ticket.repo";
import { ChromaClientFactory } from "./chroma-client.factory";
import { EmbeddingFunctionFactory } from "./chroma-emb-function";

export class SqlTicketRepoAdapter implements TicketRepoPort {
  private db: Database.Database;
  private chromaClient: ChromaClient;
  private collectionName = "tickets";
  private _chromaEmbeddingFunctionFactory: EmbeddingFunctionFactory;

  constructor(dbPath: string = "./data/local.db") {
    this.db = new Database(dbPath);
    this.chromaClient = new ChromaClientFactory().create();
    this.initDatabase();
    this._chromaEmbeddingFunctionFactory = new EmbeddingFunctionFactory();
  }

  private initDatabase() {
    // Enable foreign key constraints
    this.db.pragma("foreign_keys = ON");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        kb_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT,
        category TEXT,
        status TEXT,
        created_at TEXT,
        metadata TEXT,
        FOREIGN KEY (kb_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_kb_id ON tickets(kb_id);
      CREATE INDEX IF NOT EXISTS idx_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_priority ON tickets(priority);
    `);
  }

  async batchWrite(tickets: Ticket[]): Promise<void> {
    // Step 1: Save to SQLite (structured data storage)
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO tickets 
      (id, kb_id, title, description, priority, category, status, created_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((tickets: Ticket[]) => {
      for (const ticket of tickets) {
        insert.run(
          ticket.id,
          ticket.kbId,
          ticket.title,
          ticket.description || null,
          ticket.priority || null,
          ticket.category || null,
          ticket.status || null,
          ticket.createdAt?.toISOString() || null,
          ticket.metadata ? JSON.stringify(ticket.metadata) : null
        );
      }
    });

    insertMany(tickets);

    // Step 2: Add to ChromaDB (vector storage for semantic search)
    await this.indexTicketsInChroma(tickets);
  }

  async query(filter: QueryFilter): Promise<Ticket[]> {
    let sql = "SELECT * FROM tickets WHERE 1=1";
    const params: any[] = [];

    if (filter.id) {
      sql += " AND id = ?";
      params.push(filter.id);
    }
    if (filter.kbId) {
      sql += " AND kb_id = ?";
      params.push(filter.kbId);
    }
    if (filter.status) {
      sql += " AND status = ?";
      params.push(filter.status);
    }
    if (filter.priority) {
      sql += " AND priority = ?";
      params.push(filter.priority);
    }
    if (filter.createdAfter) {
      sql += " AND created_at >= ?";
      params.push(filter.createdAfter); // Already an ISO string
    }
    if (filter.createdBefore) {
      sql += " AND created_at <= ?";
      params.push(filter.createdBefore); // Already an ISO string
    }

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(this.rowToTicket);
  }

  async semanticQuery(props: {
    text: string;
    topK?: number;
    filter?: QueryFilter;
  }): Promise<Ticket[]> {
    const topK = props.topK || 10;

    const embFn = await this._chromaEmbeddingFunctionFactory.get();
    const collection = await this.chromaClient.getOrCreateCollection({
      name: this.collectionName,
      embeddingFunction: embFn,
    });

    // Build ChromaDB metadata filters from QueryFilter
    const whereFilter: Record<string, any> = {};

    if (props.filter) {
      if (props.filter.kbId) {
        whereFilter.kbId = props.filter.kbId;
      }
      if (props.filter.priority) {
        whereFilter.priority = props.filter.priority;
      }
      if (props.filter.status) {
        whereFilter.status = props.filter.status;
      }
    }

    // Query ChromaDB with metadata filters
    const results = await collection.query({
      queryTexts: [props.text],
      nResults: topK,
      ...(Object.keys(whereFilter).length > 0 && { where: whereFilter }),
    });

    // Extract ticket IDs from results
    const ticketIds = results.ids[0] || [];

    if (ticketIds.length === 0) {
      return [];
    }

    // Fetch full ticket data from SQLite (only by IDs, no additional filtering)
    const sql = `SELECT * FROM tickets WHERE id IN (${ticketIds
      .map(() => "?")
      .join(",")})`;

    const rows = this.db.prepare(sql).all(...ticketIds) as any[];
    return rows.map(this.rowToTicket);
  }

  private async indexTicketsInChroma(tickets: Ticket[]) {
    const embFn = await this._chromaEmbeddingFunctionFactory.get();
    const collection = await this.chromaClient.getOrCreateCollection({
      name: this.collectionName,
      embeddingFunction: embFn,
    });

    const ids = tickets.map((t) => t.id);
    const documents = tickets.map((t) => {
      // Combine title and description for better semantic search
      return `${t.title}\n${t.description || ""}`;
    });
    const metadatas = tickets.map((t) => ({
      kbId: t.kbId,
      priority: t.priority || "",
      category: t.category || "",
      status: t.status || "",
    }));

    // Add to ChromaDB (it handles embeddings automatically)
    await collection.upsert({
      ids,
      documents,
      metadatas,
    });
  }

  private rowToTicket(row: any): Ticket {
    return Ticket.fromData({
      id: row.id,
      kbId: row.kb_id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      category: row.category,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    });
  }

  close() {
    this.db.close();
  }
}
