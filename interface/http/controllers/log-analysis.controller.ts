import { injectable } from "tsyringe";
import { logSourceConfigSchema } from "../../../features/log-analysis/dtos/log-source.dto";
import { CheckLogSourceConnection } from "../../../features/log-analysis/use-cases/check-log-source-connection.usecase";

@injectable()
export class LogAnalysisController {
  constructor(private uc: CheckLogSourceConnection) {}

  testLogSourceConnection(body: any) {
    return this.uc.execute(logSourceConfigSchema.parse(body));
  }

  testLogAnomalyDetection(body: any) {
    return this.uc.execute(logSourceConfigSchema.parse(body));
  }
}
