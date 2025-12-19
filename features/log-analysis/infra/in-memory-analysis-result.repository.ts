import { injectable } from "tsyringe";
import { AnalysisResult } from "../domain/entities/analysis-result.entity";
import { IAnalysisResultRepository } from "../ports/analysis-result.repository.port";

@injectable()
export class InMemoryAnalysisResultRepository
  implements IAnalysisResultRepository
{
  private results: Map<string, AnalysisResult> = new Map();

  async save(result: AnalysisResult): Promise<void> {
    this.results.set(result.id, result);
  }

  async findById(id: string): Promise<AnalysisResult | null> {
    return this.results.get(id) || null;
  }

  async findBySessionId(sessionId: string): Promise<AnalysisResult | null> {
    return (
      Array.from(this.results.values()).find(
        (r) => r.sessionId === sessionId
      ) || null
    );
  }

  async findBySourceId(
    sourceId: string,
    limit?: number
  ): Promise<AnalysisResult[]> {
    const filtered = Array.from(this.results.values())
      .filter((r) => r.sourceId === sourceId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async findWithAnomalies(): Promise<AnalysisResult[]> {
    return Array.from(this.results.values())
      .filter((r) => r.hasAnomalies())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string): Promise<void> {
    this.results.delete(id);
  }
}
