import Database from "better-sqlite3";
import { injectable } from "tsyringe";
import { KnowledgeBase, KnowledgeBaseStatus } from "../domain/kb.entity";

/**
 * SQLite-based knowledge base repository
 */
@injectable()
export class KBRepository {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.SQLITE_DB_PATH || "./data/tickets.db";
    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_bases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        ticket_count INTEGER DEFAULT 0,
        vector_store_path TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_kb_status ON knowledge_bases(status);
      CREATE INDEX IF NOT EXISTS idx_kb_created_at ON knowledge_bases(created_at);
    `);
  }

  async save(kb: KnowledgeBase): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_bases 
        (id, name, description, status, ticket_count, vector_store_path, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      kb.id,
      kb.name,
      kb.description || null,
      kb.status,
      kb.ticketCount,
      kb.vectorStorePath || null,
      kb.metadata ? JSON.stringify(kb.metadata) : null,
      kb.createdAt.toISOString(),
      kb.updatedAt.toISOString()
    );
  }

  async findById(id: string): Promise<KnowledgeBase | null> {
    const row = this.db
      .prepare("SELECT * FROM knowledge_bases WHERE id = ?")
      .get(id) as any;

    if (!row) return null;

    return this.rowToKnowledgeBase(row);
  }

  async findAll(): Promise<KnowledgeBase[]> {
    const rows = this.db
      .prepare("SELECT * FROM knowledge_bases ORDER BY created_at DESC")
      .all() as any[];

    return rows.map((row) => this.rowToKnowledgeBase(row));
  }

  async findByIds(ids: string[]): Promise<KnowledgeBase[]> {
    if (ids.length === 0) return [];

    const placeholders = ids.map(() => "?").join(",");
    const rows = this.db
      .prepare(`SELECT * FROM knowledge_bases WHERE id IN (${placeholders})`)
      .all(...ids) as any[];

    return rows.map((row) => this.rowToKnowledgeBase(row));
  }

  async delete(id: string): Promise<void> {
    this.db.prepare("DELETE FROM knowledge_bases WHERE id = ?").run(id);
  }

  async exists(id: string): Promise<boolean> {
    const result = this.db
      .prepare("SELECT 1 FROM knowledge_bases WHERE id = ? LIMIT 1")
      .get(id);
    return !!result;
  }

  private rowToKnowledgeBase(row: any): KnowledgeBase {
    return new KnowledgeBase({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status as KnowledgeBaseStatus,
      ticketCount: row.ticket_count,
      vectorStorePath: row.vector_store_path,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
