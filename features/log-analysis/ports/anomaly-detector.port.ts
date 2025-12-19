import { Anomaly } from "../domain/entities/analysis-result.entity";
import { LogEntry } from "../domain/entities/log-entry.entity";
import { DetectionModelConfig } from "../domain/value-objects/detection-model-config.vo";

export interface IAnomalyDetector {
  /**
   * Analyze logs and detect anomalies
   */
  analyze(logs: LogEntry[], config: DetectionModelConfig): Promise<Anomaly[]>;

  /**
   * Get the model type this detector supports
   */
  getModelType(): string;
}
