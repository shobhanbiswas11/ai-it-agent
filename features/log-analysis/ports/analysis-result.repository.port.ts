import { AnalysisResult } from "../domain/entities/analysis-result.entity";

export interface IAnalysisResultRepository {
  save(result: AnalysisResult): Promise<void>;
  findById(id: string): Promise<AnalysisResult | null>;
  findBySessionId(sessionId: string): Promise<AnalysisResult | null>;
  findBySourceId(sourceId: string, limit?: number): Promise<AnalysisResult[]>;
  findWithAnomalies(): Promise<AnalysisResult[]>;
  delete(id: string): Promise<void>;
}
