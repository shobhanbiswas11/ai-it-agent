import { inject, singleton } from "tsyringe";
import { GptLogAnomalyDetectorAdapter } from "../infra/gpt-log-anomaly-detector.adapter";
import { LogAnomalyDetectorPortKeys } from "../ports/log-anomaly-detector.port";

@singleton()
export class LogAnomalyDetectorFactory {
  constructor(
    @inject(LogAnomalyDetectorPortKeys.gpt)
    private _gptLogAnomalyDetector: GptLogAnomalyDetectorAdapter
  ) {}

  getLogAnomalyDetector(): GptLogAnomalyDetectorAdapter {
    return this._gptLogAnomalyDetector;
  }
}
