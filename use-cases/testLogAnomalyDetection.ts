import { LogAnomalyTestReportDTO } from "../dtos/logAnomalyTestReport.dto";
import { ILogAnomalyDetector } from "../ports/ILogAnomalyDetector";
import { ILogFetcher } from "../ports/ILogFetcher";

export class TestLogAnomalyDetection {
  constructor(
    private _logFetcher: ILogFetcher,
    private _anomalyDetector: ILogAnomalyDetector
  ) {}

  async execute() {
    try {
      const { logs: rawLogs } = await this._logFetcher.fetchLogs();
      const anomalies = await this._anomalyDetector.detectAnomalies({
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
