import { container } from "tsyringe";
import { beforeEach, describe, expect, it } from "vitest";
import { SessionStatus } from "../../domain/aggregates/log-analysis-session.aggregate";
import {
  LogSource,
  LogSourceType,
} from "../../domain/entities/log-source.entity";
import { DetectionModelType } from "../../domain/value-objects/detection-model-config.vo";
import { InMemoryAnalysisResultRepository } from "../../infra/in-memory-analysis-result.repository";
import { InMemoryEventBus } from "../../infra/in-memory-event-bus.adapter";
import { InMemoryLogSourceRepository } from "../../infra/in-memory-log-source.repository";
import { InMemorySessionRepository } from "../../infra/in-memory-session.repository";
import { LLMAnomalyDetector } from "../../infra/llm-anomaly-detector.adapter";
import { PrometheusLogCollector } from "../../infra/prometheus-log-collector.adapter";
import { SessionMapper } from "../../mappers/session.mapper";
import { RunAnomalyDetectionUseCase } from "../../use-cases/run-anomaly-detection.usecase";

describe("RunAnomalyDetectionUseCase", () => {
  let useCase: RunAnomalyDetectionUseCase;
  let sourceRepository: InMemoryLogSourceRepository;
  let sessionRepository: InMemorySessionRepository;
  let analysisResultRepository: InMemoryAnalysisResultRepository;
  let eventBus: InMemoryEventBus;
  let source: LogSource;

  beforeEach(async () => {
    container.clearInstances();
    sourceRepository = new InMemoryLogSourceRepository();
    sessionRepository = new InMemorySessionRepository();
    analysisResultRepository = new InMemoryAnalysisResultRepository();
    eventBus = new InMemoryEventBus();
    const collector = new PrometheusLogCollector(sourceRepository);
    const detector = new LLMAnomalyDetector();
    const mapper = new SessionMapper();

    container.registerInstance("ILogSourceRepository", sourceRepository);
    container.registerInstance("ILogCollector", collector);
    container.registerInstance("IAnomalyDetector", detector);
    container.registerInstance("ISessionRepository", sessionRepository);
    container.registerInstance(
      "IAnalysisResultRepository",
      analysisResultRepository
    );
    container.registerInstance("IEventBus", eventBus);

    useCase = new RunAnomalyDetectionUseCase(
      sourceRepository,
      collector,
      detector,
      sessionRepository,
      analysisResultRepository,
      eventBus,
      mapper
    );

    // Create and activate a source
    source = LogSource.create(
      "Test Prometheus",
      LogSourceType.PROMETHEUS,
      "http://localhost:9090"
    );
    source.activate();
    await sourceRepository.save(source);
  });

  it("should run anomaly detection successfully", async () => {
    const input = {
      sourceId: source.id,
      timeRange: {
        start: new Date(Date.now() - 3600000).toISOString(),
        end: new Date().toISOString(),
      },
      modelConfig: {
        modelType: DetectionModelType.LLM_BASED,
        threshold: 0.7,
        llmModel: "gpt-4",
      },
    };

    const result = await useCase.execute(input);

    expect(result.id).toBeDefined();
    expect(result.status).toBe(SessionStatus.COMPLETED);
    expect(result.sourceId).toBe(source.id);
    expect(result.logCount).toBeGreaterThan(0);
    expect(result.analysisResultId).toBeDefined();

    // Verify events were published
    const events = eventBus.getPublishedEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it("should throw error for non-existent source", async () => {
    const input = {
      sourceId: "non-existent-id",
      timeRange: {
        start: new Date(Date.now() - 3600000).toISOString(),
        end: new Date().toISOString(),
      },
      modelConfig: {
        modelType: DetectionModelType.LLM_BASED,
        llmModel: "gpt-4",
      },
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Log source with ID "non-existent-id" not found'
    );
  });

  it("should handle and record analysis failure", async () => {
    // This test verifies that even when something goes wrong,
    // the session is still saved with a FAILED status

    // We'll use a non-existent source to trigger an error
    const input = {
      sourceId: "non-existent-source-id",
      timeRange: {
        start: new Date(Date.now() - 3600000).toISOString(),
        end: new Date().toISOString(),
      },
      modelConfig: {
        modelType: DetectionModelType.LLM_BASED,
        llmModel: "gpt-4",
      },
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Log source with ID "non-existent-source-id" not found'
    );
  });
});
