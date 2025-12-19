import { container } from "tsyringe";
import { IAnalysisResultRepository } from "./ports/analysis-result.repository.port";
import { IAnomalyDetector } from "./ports/anomaly-detector.port";
import { IEventBus } from "./ports/event-bus.port";
import { ILogCollector } from "./ports/log-collector.port";
import { ILogEntryRepository } from "./ports/log-entry.repository.port";
import { ILogSourceRepository } from "./ports/log-source.repository.port";
import { ISessionRepository } from "./ports/session.repository.port";

import { InMemoryAnalysisResultRepository } from "./infra/in-memory-analysis-result.repository";
import { InMemoryEventBus } from "./infra/in-memory-event-bus.adapter";
import { InMemoryLogEntryRepository } from "./infra/in-memory-log-entry.repository";
import { InMemoryLogSourceRepository } from "./infra/in-memory-log-source.repository";
import { InMemorySessionRepository } from "./infra/in-memory-session.repository";
import { LLMAnomalyDetector } from "./infra/llm-anomaly-detector.adapter";
import { PrometheusLogCollector } from "./infra/prometheus-log-collector.adapter";

import { AnalysisResultMapper } from "./mappers/analysis-result.mapper";
import { LogEntryMapper } from "./mappers/log-entry.mapper";
import { LogSourceMapper } from "./mappers/log-source.mapper";
import { SessionMapper } from "./mappers/session.mapper";

import { CollectLogsUseCase } from "./use-cases/collect-logs.usecase";
import { RegisterLogSourceUseCase } from "./use-cases/register-log-source.usecase";
import { RunAnomalyDetectionUseCase } from "./use-cases/run-anomaly-detection.usecase";
import { ViewAnalysisResultsUseCase } from "./use-cases/view-analysis-results.usecase";

/**
 * Configure dependency injection container for log-analysis feature
 */
export function configureContainer(): void {
  // Register repositories
  container.registerSingleton<ILogSourceRepository>(
    "ILogSourceRepository",
    InMemoryLogSourceRepository
  );
  container.registerSingleton<ILogEntryRepository>(
    "ILogEntryRepository",
    InMemoryLogEntryRepository
  );
  container.registerSingleton<IAnalysisResultRepository>(
    "IAnalysisResultRepository",
    InMemoryAnalysisResultRepository
  );
  container.registerSingleton<ISessionRepository>(
    "ISessionRepository",
    InMemorySessionRepository
  );

  // Register adapters
  container.registerSingleton<IEventBus>("IEventBus", InMemoryEventBus);

  // For log collectors, you might want to use a factory pattern to select the right one
  // For now, using Prometheus as default
  container.registerSingleton<ILogCollector>(
    "ILogCollector",
    PrometheusLogCollector
  );

  // Register anomaly detector
  container.registerSingleton<IAnomalyDetector>(
    "IAnomalyDetector",
    LLMAnomalyDetector
  );

  // Register mappers
  container.registerSingleton(LogSourceMapper);
  container.registerSingleton(LogEntryMapper);
  container.registerSingleton(AnalysisResultMapper);
  container.registerSingleton(SessionMapper);

  // Register use cases
  container.registerSingleton(RegisterLogSourceUseCase);
  container.registerSingleton(CollectLogsUseCase);
  container.registerSingleton(RunAnomalyDetectionUseCase);
  container.registerSingleton(ViewAnalysisResultsUseCase);
}

/**
 * Get a use case instance from the container
 */
export function getUseCase<T>(useCaseClass: new (...args: any[]) => T): T {
  return container.resolve(useCaseClass);
}

/**
 * Clear the container (useful for testing)
 */
export function clearContainer(): void {
  container.clearInstances();
}
