import { LogAnalysisSession } from "../domain/aggregates/log-analysis-session.aggregate";

export interface ISessionRepository {
  save(session: LogAnalysisSession): Promise<void>;
  findById(id: string): Promise<LogAnalysisSession | null>;
  findBySourceId(sourceId: string): Promise<LogAnalysisSession[]>;
  findActive(): Promise<LogAnalysisSession[]>;
  update(session: LogAnalysisSession): Promise<void>;
  delete(id: string): Promise<void>;
}
