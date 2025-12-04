import { Request, Response, Router } from "express";
import { injectable } from "tsyringe";
import { logSourceConfigSchema } from "../../../features/log-analysis/dtos/log-source.dto";
import { CheckLogSourceConnection } from "../../../features/log-analysis/use-cases/check-log-source-connection.usecase";
import { TestLogAnomalyDetection } from "../../../features/log-analysis/use-cases/test-log-anomaly-detection.usecase";

@injectable()
export class LogAnalysisController {
  public router: Router;

  constructor(
    private checkConnection: CheckLogSourceConnection,
    private testAnomalyDetection: TestLogAnomalyDetection
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/test-connection",
      this.testLogSourceConnection.bind(this)
    );
    this.router.post(
      "/test-anomaly-detection",
      this.testLogAnomalyDetection.bind(this)
    );
  }

  async testLogSourceConnection(req: Request, res: Response) {
    const config = logSourceConfigSchema.parse(req.body);
    const result = await this.checkConnection.execute(config);
    res.json({
      success: true,
      data: result,
    });
  }

  async testLogAnomalyDetection(req: Request, res: Response) {
    const config = logSourceConfigSchema.parse(req.body);
    const result = await this.testAnomalyDetection.execute(config);
    res.json({
      success: true,
      data: result,
    });
  }
}
