import { injectable } from "tsyringe";
import { LogAnalysisSession } from "../domain/aggregates/log-analysis-session.aggregate";
import { LogAnalysisSessionDTO } from "../dtos/session.dto";

@injectable()
export class SessionMapper {
  toDTO(aggregate: LogAnalysisSession): LogAnalysisSessionDTO {
    return {
      id: aggregate.id,
      sourceId: aggregate.source.id,
      sourceName: aggregate.source.name,
      timeRange: {
        start: aggregate.timeRange.start.toISOString(),
        end: aggregate.timeRange.end.toISOString(),
      },
      modelConfig: {
        modelType: aggregate.modelConfig.modelType,
        threshold: aggregate.modelConfig.threshold,
        sensitivity: aggregate.modelConfig.sensitivity,
        parameters: aggregate.modelConfig.parameters,
        llmModel: aggregate.modelConfig.llmModel,
        llmPrompt: aggregate.modelConfig.llmPrompt,
      },
      status: aggregate.status,
      logCount: aggregate.logEntries.length,
      analysisResultId: aggregate.analysisResult?.id,
      error: aggregate.error,
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
    };
  }

  toDTOList(aggregates: LogAnalysisSession[]): LogAnalysisSessionDTO[] {
    return aggregates.map((aggregate) => this.toDTO(aggregate));
  }
}
