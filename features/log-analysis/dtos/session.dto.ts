import { SessionStatus } from "../domain/aggregates/log-analysis-session.aggregate";
import { DetectionModelType } from "../domain/value-objects/detection-model-config.vo";

export interface TimeRangeDTO {
  start: string;
  end: string;
}

export interface DetectionModelConfigDTO {
  modelType: DetectionModelType;
  threshold?: number;
  sensitivity?: number;
  parameters?: Record<string, any>;
  llmModel?: string;
  llmPrompt?: string;
}

export interface LogAnalysisSessionDTO {
  id: string;
  sourceId: string;
  sourceName: string;
  timeRange: TimeRangeDTO;
  modelConfig: DetectionModelConfigDTO;
  status: SessionStatus;
  logCount: number;
  analysisResultId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDTO {
  sourceId: string;
  timeRange: TimeRangeDTO;
  modelConfig: DetectionModelConfigDTO;
}
