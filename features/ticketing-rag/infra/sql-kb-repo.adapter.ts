import Database from "better-sqlite3";
import { KnowledgeBase } from "../domain/entities/knowledge-base.entity";
import { KbRepoPort } from "../ports/kb-repo.port";

export class SqlKbRepoAdapter implements KbRepoPort {
  private db: Database.Database;

  constructor(dbPath: string = "./data/local.db") {
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
    // Enable foreign key constraints
    this.db.pragma("foreign_keys = ON");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_bases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        field_map TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_name ON knowledge_bases(name);
    `);
  }

  async save(kb: KnowledgeBase): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_bases 
      (id, name, description, field_map, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      kb.id,
      kb.name,
      kb.description || null,
      JSON.stringify(kb.fieldMap),
      new Date().toISOString()
    );
  }

  async findById(kbId: string): Promise<KnowledgeBase | null> {
    const stmt = this.db.prepare(`
      SELECT id, name, description, field_map
      FROM knowledge_bases
      WHERE id = ?
    `);

    const row = stmt.get(kbId) as
      | {
          id: string;
          name: string;
          description: string | null;
          field_map: string;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return new KnowledgeBase({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      fieldMap: JSON.parse(row.field_map),
    });
  }

  close() {
    this.db.close();
  }
}
