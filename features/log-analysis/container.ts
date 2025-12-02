import "reflect-metadata";
import { container } from "tsyringe";
import { GptLogAnomalyDetector } from "./infra/gpt-log-anomaly-detector";
import { LogSourceFactory } from "./infra/log-source-factory";
import { ILogAnomalyDetector } from "./ports/ILogAnomalyDetector";
import { ILogSourceFactory } from "./ports/ILogSourceFactory";
import { CheckLogSourceConnection } from "./use-cases/checkLogSourceConnection";
import { TestLogAnomalyDetection } from "./use-cases/testLogAnomalyDetection";

// Register implementations for interfaces
container.registerSingleton<ILogSourceFactory>(
  "ILogSourceFactory",
  LogSourceFactory
);
container.registerSingleton<ILogAnomalyDetector>(
  "ILogAnomalyDetector",
  GptLogAnomalyDetector
);

// Register use cases
container.registerSingleton(CheckLogSourceConnection);
container.registerSingleton(TestLogAnomalyDetection);

export { container };
