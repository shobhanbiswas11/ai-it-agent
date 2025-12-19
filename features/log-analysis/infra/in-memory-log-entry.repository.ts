import { injectable } from "tsyringe";
import { LogEntry } from "../domain/entities/log-entry.entity";
import { ILogEntryRepository } from "../ports/log-entry.repository.port";

@injectable()
export class InMemoryLogEntryRepository implements ILogEntryRepository {
  private entries: Map<string, LogEntry> = new Map();

  async save(entry: LogEntry): Promise<void> {
    this.entries.set(entry.id, entry);
  }

  async saveBatch(entries: LogEntry[]): Promise<void> {
    for (const entry of entries) {
      this.entries.set(entry.id, entry);
    }
  }

  async findById(id: string): Promise<LogEntry | null> {
    return this.entries.get(id) || null;
  }

  async findBySourceId(sourceId: string, limit?: number): Promise<LogEntry[]> {
    const filtered = Array.from(this.entries.values()).filter(
      (e) => e.sourceId === sourceId
    );
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async findBySessionId(sessionId: string): Promise<LogEntry[]> {
    return Array.from(this.entries.values()).filter(
      (e) => e.metadata?.sessionId === sessionId
    );
  }

  async delete(id: string): Promise<void> {
    this.entries.delete(id);
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    const toDelete = Array.from(this.entries.values())
      .filter((e) => e.sourceId === sourceId)
      .map((e) => e.id);
    toDelete.forEach((id) => this.entries.delete(id));
  }
}
