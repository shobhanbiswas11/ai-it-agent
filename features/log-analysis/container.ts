import "reflect-metadata";
import { container } from "tsyringe";
import { GptLogAnomalyDetector } from "./infra/gpt-log-anomaly-detector.adapter";
import { LogSourceFactory } from "./infra/log-source-factory";
import { ILogAnomalyDetector } from "./ports/log-anomaly-detector";
import { ILogSourceFactory } from "./ports/log-source.factory.port";
import { CheckLogSourceConnection } from "./use-cases/check-log-source-connection.usecase";
import { TestLogAnomalyDetection } from "./use-cases/test-log-anomaly-detection.usecase";

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
