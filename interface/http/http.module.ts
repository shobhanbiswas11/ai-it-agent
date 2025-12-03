import { DependencyContainer } from "tsyringe";
import { LogAnalysisController } from "./controllers/log-analysis.controller";
import { ToolController } from "./controllers/tool.controller";

export function registerHttpModule(container: DependencyContainer) {
  container.registerSingleton(ToolController);
  container.registerSingleton(LogAnalysisController);
}
