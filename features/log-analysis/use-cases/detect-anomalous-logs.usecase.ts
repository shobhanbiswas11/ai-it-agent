import { Log } from "../domain/log.entity";
import { ILogAnomalyDetector } from "../ports/log-anomaly-detector.port";

export class DetectAnomalousLogs {
  constructor(private _anomalyDetector: ILogAnomalyDetector) {}

  async execute(logs: Log[]) {
    const payload = logs.map((log) => log.raw);
    const res = await this._anomalyDetector.detectAnomalies({ logs: payload });

    for (const result of res.anomalousLogs) {
      const log = logs[result.originalIndex];
      log.markAnomalous({ score: result.score, reason: result.reason });
    }

    return logs;
  }
}
