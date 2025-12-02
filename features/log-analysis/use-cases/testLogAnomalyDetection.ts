import { inject, injectable } from "tsyringe";
import { LogAnomalyTestReportDTO } from "../dtos/log-anomaly-report.dto";
import { LogSourceConfig } from "../dtos/log-source.dto";
import { ILogAnomalyDetector } from "../ports/ILogAnomalyDetector";
import { ILogSourceFactory } from "../ports/ILogSourceFactory";

@injectable()
export class TestLogAnomalyDetection {
  constructor(
    @inject("ILogSourceFactory") private logSourceFactory: ILogSourceFactory,
    @inject("ILogAnomalyDetector") private anomalyDetector: ILogAnomalyDetector
  ) {}

  async execute(config: LogSourceConfig) {
    try {
      const { logs: rawLogs } = await this.logSourceFactory
        .getLogSource(config)
        .fetchLogs();
      const anomalies = await this.anomalyDetector.detectAnomalies({
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
