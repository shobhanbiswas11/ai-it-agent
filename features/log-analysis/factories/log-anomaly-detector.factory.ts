import { inject, singleton } from "tsyringe";
import {
  LogAnomalyDetectorPort,
  LogAnomalyDetectorPortKeys,
} from "../ports/log-anomaly-detector.port";

@singleton()
export class LogAnomalyDetectorFactory {
  constructor(
    @inject(LogAnomalyDetectorPortKeys.gpt)
    private _gptLogAnomalyDetector: LogAnomalyDetectorPort
  ) {}

  create(): LogAnomalyDetectorPort {
    return this._gptLogAnomalyDetector;
  }
}
