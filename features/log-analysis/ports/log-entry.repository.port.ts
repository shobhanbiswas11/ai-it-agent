import { LogEntry } from "../domain/entities/log-entry.entity";

export interface ILogEntryRepository {
  save(entry: LogEntry): Promise<void>;
  saveBatch(entries: LogEntry[]): Promise<void>;
  findById(id: string): Promise<LogEntry | null>;
  findBySourceId(sourceId: string, limit?: number): Promise<LogEntry[]>;
  findBySessionId(sessionId: string): Promise<LogEntry[]>;
  delete(id: string): Promise<void>;
  deleteBySourceId(sourceId: string): Promise<void>;
}
