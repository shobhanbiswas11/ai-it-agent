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

export interface LogAnomalyDetectorPort {
  detectAnomalies(
    payload: AnomalyDetectionPayload
  ): Promise<AnomalyDetectionResponse>;
}

export const LogAnomalyDetectorPortKeys = {
  gpt: Symbol("GptLogAnomalyDetector"),
};
