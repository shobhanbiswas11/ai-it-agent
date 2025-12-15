import { singleton } from "tsyringe";
import { Log } from "../domain/log.entity";
import { LogAnomalyDetectorFactory } from "../factories/log-anomaly-detector.factory";

@singleton()
export class DetectAnomalousLogs {
  constructor(private _anomalyDetectorFactory: LogAnomalyDetectorFactory) {}

  async execute(logs: Log[]) {
    const payload = logs.map((log) => log.raw);
    const res = await this._anomalyDetectorFactory
      .getLogAnomalyDetector()
      .detectAnomalies({ logs: payload });
    for (const result of res.anomalousLogs) {
      const log = logs[result.originalIndex];
      log.markAnomalous({ score: result.score, reason: result.reason });
    }

    return logs;
  }
}
