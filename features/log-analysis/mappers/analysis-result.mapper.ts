import { injectable } from "tsyringe";
import {
  AnalysisResult,
  Anomaly,
} from "../domain/entities/analysis-result.entity";
import {
  AnalysisReportDTO,
  AnalysisResultDTO,
  AnomalyDTO,
} from "../dtos/analysis-result.dto";

@injectable()
export class AnalysisResultMapper {
  toAnomalyDTO(anomaly: Anomaly): AnomalyDTO {
    return {
      type: anomaly.type,
      severity: anomaly.severity,
      description: anomaly.description,
      logEntryIds: [...anomaly.logEntryIds],
      score: anomaly.score,
      metadata: anomaly.metadata,
    };
  }

  toDTO(entity: AnalysisResult): AnalysisResultDTO {
    return {
      id: entity.id,
      sessionId: entity.sessionId,
      sourceId: entity.sourceId,
      modelType: entity.modelType,
      analyzedLogCount: entity.analyzedLogCount,
      anomalies: entity.anomalies.map((a) => this.toAnomalyDTO(a)),
      summary: entity.summary,
      startTime: entity.startTime.toISOString(),
      endTime: entity.endTime.toISOString(),
      createdAt: entity.createdAt.toISOString(),
    };
  }

  toDTOList(entities: AnalysisResult[]): AnalysisResultDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }

  toReportDTO(entity: AnalysisResult): AnalysisReportDTO {
    return {
      result: this.toDTO(entity),
      criticalCount: entity.criticalAnomalies.length,
      highSeverityCount: entity.highSeverityAnomalies.length,
      totalAnomalies: entity.anomalies.length,
      hasAnomalies: entity.hasAnomalies(),
    };
  }

  toEntity(dto: AnalysisResultDTO): AnalysisResult {
    return new AnalysisResult({
      id: dto.id,
      sessionId: dto.sessionId,
      sourceId: dto.sourceId,
      modelType: dto.modelType,
      analyzedLogCount: dto.analyzedLogCount,
      anomalies: dto.anomalies,
      summary: dto.summary,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      createdAt: new Date(dto.createdAt),
    });
  }
}
