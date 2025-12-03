import Database from "better-sqlite3";
import { injectable } from "tsyringe";
import { Ticket } from "../domain/ticket.entity";
import {
  SQLQueryResult,
  TicketFilter,
  TicketQueryResult,
  TicketRepositoryPort,
} from "../ports/ticket.repository.port";

/**
 * SQLite-based ticket repository
 */
@injectable()
export class SQLiteTicketRepository implements TicketRepositoryPort {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.SQLITE_DB_PATH || "./data/tickets.db";
    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        kb_id TEXT NOT NULL,
        text TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_kb_id ON tickets(kb_id);
    `);
  }

  async saveTickets(kbId: string, tickets: Ticket[]): Promise<void> {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO tickets (id, kb_id, text, metadata)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((tickets: Ticket[]) => {
      for (const ticket of tickets) {
        insert.run(
          ticket.id,
          kbId,
          ticket.text,
          JSON.stringify(ticket.metadata || {})
        );
      }
    });

    insertMany(tickets);
    console.log(`Saved ${tickets.length} tickets to KB ${kbId} in SQLite`);
  }

  async findTickets(filter: TicketFilter): Promise<Ticket[]> {
    let query = "SELECT * FROM tickets WHERE 1=1";
    const params: any[] = [];

    if (filter.kbId) {
      query += " AND kb_id = ?";
      params.push(filter.kbId);
    }

    if (filter.ids && filter.ids.length > 0) {
      query += ` AND id IN (${filter.ids.map(() => "?").join(",")})`;
      params.push(...filter.ids);
    }

    const rows = this.db.prepare(query).all(...params) as any[];

    return rows.map(
      (row) =>
        new Ticket({
          id: row.id,
          text: row.text,
          metadata: JSON.parse(row.metadata || "{}"),
        })
    );
  }

  async queryWithAggregations(
    kbId: string,
    aggregationQuery: Record<string, any>
  ): Promise<TicketQueryResult> {
    const tickets = await this.findTickets({ kbId });
    return { tickets, total: tickets.length, aggregations: {} };
  }

  async deleteByKnowledgeBase(kbId: string): Promise<void> {
    this.db.prepare("DELETE FROM tickets WHERE kb_id = ?").run(kbId);
  }

  async countByKnowledgeBase(kbId: string): Promise<number> {
    const result = this.db
      .prepare("SELECT COUNT(*) as count FROM tickets WHERE kb_id = ?")
      .get(kbId) as { count: number };
    return result.count;
  }

  async executeSQLQuery(
    sqlQuery: string,
    kbIds: string[]
  ): Promise<SQLQueryResult> {
    try {
      let finalQuery = sqlQuery;
      if (kbIds.length > 0 && !sqlQuery.toLowerCase().includes("kb_id")) {
        const kbFilter = `kb_id IN (${kbIds.map(() => "?").join(",")})`;
        if (sqlQuery.toLowerCase().includes("where")) {
          finalQuery = sqlQuery.replace(/where/i, `WHERE ${kbFilter} AND`);
        } else {
          finalQuery = sqlQuery.replace(
            /from\s+tickets/i,
            `FROM tickets WHERE ${kbFilter}`
          );
        }
      }

      const stmt = this.db.prepare(finalQuery);
      const rows: any[] = kbIds.length > 0 ? stmt.all(...kbIds) : stmt.all();

      return {
        rows,
        rowCount: rows.length,
        fields: rows.length > 0 ? Object.keys(rows[0]) : [],
      };
    } catch (error: any) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
  }
}
