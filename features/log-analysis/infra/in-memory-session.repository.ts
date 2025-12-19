import { injectable } from "tsyringe";
import {
  LogAnalysisSession,
  SessionStatus,
} from "../domain/aggregates/log-analysis-session.aggregate";
import { ISessionRepository } from "../ports/session.repository.port";

@injectable()
export class InMemorySessionRepository implements ISessionRepository {
  private sessions: Map<string, LogAnalysisSession> = new Map();

  async save(session: LogAnalysisSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<LogAnalysisSession | null> {
    return this.sessions.get(id) || null;
  }

  async findBySourceId(sourceId: string): Promise<LogAnalysisSession[]> {
    return Array.from(this.sessions.values()).filter(
      (s) => s.source.id === sourceId
    );
  }

  async findActive(): Promise<LogAnalysisSession[]> {
    return Array.from(this.sessions.values()).filter(
      (s) =>
        s.status === SessionStatus.COLLECTING ||
        s.status === SessionStatus.ANALYZING
    );
  }

  async update(session: LogAnalysisSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }
}
