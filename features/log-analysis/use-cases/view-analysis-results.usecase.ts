import { inject, injectable } from "tsyringe";
import { Severity } from "../domain/entities/analysis-result.entity";
import {
  AnalysisDashboardDTO,
  AnalysisReportDTO,
  AnalysisResultDTO,
  AnomalyDTO,
} from "../dtos/analysis-result.dto";
import { AnalysisResultMapper } from "../mappers/analysis-result.mapper";
import { IAnalysisResultRepository } from "../ports/analysis-result.repository.port";
import { ILogSourceRepository } from "../ports/log-source.repository.port";

@injectable()
export class ViewAnalysisResultsUseCase {
  constructor(
    @inject("IAnalysisResultRepository")
    private readonly analysisResultRepository: IAnalysisResultRepository,
    @inject("ILogSourceRepository")
    private readonly logSourceRepository: ILogSourceRepository,
    private readonly mapper: AnalysisResultMapper
  ) {}

  async getResultById(id: string): Promise<AnalysisResultDTO> {
    const result = await this.analysisResultRepository.findById(id);
    if (!result) {
      throw new Error(`Analysis result with ID "${id}" not found`);
    }
    return this.mapper.toDTO(result);
  }

  async getResultBySessionId(
    sessionId: string
  ): Promise<AnalysisResultDTO | null> {
    const result = await this.analysisResultRepository.findBySessionId(
      sessionId
    );
    return result ? this.mapper.toDTO(result) : null;
  }

  async getReportById(id: string): Promise<AnalysisReportDTO> {
    const result = await this.analysisResultRepository.findById(id);
    if (!result) {
      throw new Error(`Analysis result with ID "${id}" not found`);
    }
    return this.mapper.toReportDTO(result);
  }

  async getDashboard(limit: number = 10): Promise<AnalysisDashboardDTO> {
    // Get recent results
    const allResults = await this.analysisResultRepository.findWithAnomalies();
    const recentResults = allResults.slice(0, limit);

    // Calculate statistics
    const totalAnalyzed = allResults.reduce(
      (sum, r) => sum + r.analyzedLogCount,
      0
    );
    const totalAnomalies = allResults.reduce(
      (sum, r) => sum + r.anomalies.length,
      0
    );

    // Get critical alerts
    const criticalAlerts: AnomalyDTO[] = [];
    for (const result of recentResults) {
      const critical = result.criticalAnomalies;
      criticalAlerts.push(...critical.map((a) => this.mapper.toAnomalyDTO(a)));
    }

    // Calculate source statistics
    const sourceMap = new Map<string, { count: number; lastAnalysis: Date }>();
    for (const result of allResults) {
      const existing = sourceMap.get(result.sourceId);
      if (!existing || result.createdAt > existing.lastAnalysis) {
        sourceMap.set(result.sourceId, {
          count: (existing?.count || 0) + result.anomalies.length,
          lastAnalysis: result.createdAt,
        });
      }
    }

    // Get source names
    const sources = await this.logSourceRepository.findAll();
    const sourceStats = Array.from(sourceMap.entries()).map(
      ([sourceId, stats]) => {
        const source = sources.find((s) => s.id === sourceId);
        return {
          sourceId,
          sourceName: source?.name || "Unknown",
          anomalyCount: stats.count,
          lastAnalysis: stats.lastAnalysis.toISOString(),
        };
      }
    );

    return {
      recentResults: this.mapper.toDTOList(recentResults),
      totalAnalyzed,
      totalAnomalies,
      criticalAlerts,
      sourceStats,
    };
  }

  async getAlertsForSource(
    sourceId: string,
    severityLevel?: Severity
  ): Promise<AnomalyDTO[]> {
    const results = await this.analysisResultRepository.findBySourceId(
      sourceId
    );
    const alerts: AnomalyDTO[] = [];

    for (const result of results) {
      const anomalies = severityLevel
        ? result.anomalies.filter((a) => a.severity === severityLevel)
        : result.anomalies;

      alerts.push(...anomalies.map((a) => this.mapper.toAnomalyDTO(a)));
    }

    return alerts;
  }
}
