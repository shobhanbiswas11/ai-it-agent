import { container } from "../../../features/log-analysis/container";
import { logSourceConfigSchema } from "../../../features/log-analysis/dtos/log-source.dto";
import { CheckLogSourceConnection } from "../../../features/log-analysis/use-cases/checkLogSourceConnection";
import { TestLogAnomalyDetection } from "../../../features/log-analysis/use-cases/testLogAnomalyDetection";

export class LogAnalysisController {
  constructor() {}

  testLogSourceConnection(body: any) {
    const uc = container.resolve(CheckLogSourceConnection);
    return uc.execute(logSourceConfigSchema.parse(body));
  }

  testLogAnomalyDetection(body: any) {
    const us = container.resolve(TestLogAnomalyDetection);
    return us.execute(logSourceConfigSchema.parse(body));
  }
}
