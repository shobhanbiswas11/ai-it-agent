export interface AnomalyDetectionPayload {
  logs: string[];
}

export interface AnomalyDetectionResponse {
  anomalousLogs: {
    log: string;
    originalIndex: number;
    score?: number;
    reason?: string;
  }[];
}

export interface ILogAnomalyDetector {
  detectAnomalies(
    payload: AnomalyDetectionPayload
  ): Promise<AnomalyDetectionResponse>;
}
