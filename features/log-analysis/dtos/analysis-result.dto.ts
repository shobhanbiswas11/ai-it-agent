import {
  AnomalyType,
  Severity,
} from "../domain/entities/analysis-result.entity";

export interface AnomalyDTO {
  type: AnomalyType;
  severity: Severity;
  description: string;
  logEntryIds: string[];
  score: number;
  metadata?: Record<string, any>;
}

export interface AnalysisResultDTO {
  id: string;
  sessionId: string;
  sourceId: string;
  modelType: string;
  analyzedLogCount: number;
  anomalies: AnomalyDTO[];
  summary: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface AnalysisReportDTO {
  result: AnalysisResultDTO;
  criticalCount: number;
  highSeverityCount: number;
  totalAnomalies: number;
  hasAnomalies: boolean;
}

export interface AnalysisDashboardDTO {
  recentResults: AnalysisResultDTO[];
  totalAnalyzed: number;
  totalAnomalies: number;
  criticalAlerts: AnomalyDTO[];
  sourceStats: {
    sourceId: string;
    sourceName: string;
    anomalyCount: number;
    lastAnalysis: string;
  }[];
}
