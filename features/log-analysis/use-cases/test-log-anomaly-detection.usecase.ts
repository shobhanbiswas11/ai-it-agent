import { singleton } from "tsyringe";
import { LogAnomalyTestReportDTO } from "../dtos/log-anomaly-report.dto";
import { TestLogAnomalyDetectionRequestDto } from "../dtos/test-log-anomaly-detection.dto";
import { LogAnomalyDetectorFactory } from "../factories/log-anomaly-detector.factory";
import { LogSourceFactory } from "../factories/log-source.factory";

@singleton()
export class TestLogAnomalyDetection {
  constructor(
    private _logSourceFactory: LogSourceFactory,
    private _anomalyDetectorFactory: LogAnomalyDetectorFactory
  ) {}

  async execute({
    sourceType,
    sourceConfig,
  }: TestLogAnomalyDetectionRequestDto) {
    try {
      const { logs: rawLogs } = await this._logSourceFactory
        .create(sourceType, sourceConfig)
        .fetchLogs();
      const anomalies = await this._anomalyDetectorFactory
        .create()
        .detectAnomalies({
          logs: rawLogs.slice(0, 50),
        });

      const successReport: LogAnomalyTestReportDTO = {
        status: "success",
        logProcessed: 50,
        anomaliesDetected: anomalies.anomalousLogs.length,
        anomalies: anomalies.anomalousLogs.map((anomaly) => ({
          log: anomaly.log,
          score: anomaly.score,
          reason: anomaly.reason,
        })),
      };
      return successReport;
    } catch (error) {
      const errorReport: LogAnomalyTestReportDTO = {
        status: "failure",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
      return errorReport;
    }
  }
}
