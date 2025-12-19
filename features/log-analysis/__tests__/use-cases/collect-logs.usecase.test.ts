import { container } from "tsyringe";
import { beforeEach, describe, expect, it } from "vitest";
import {
  LogSource,
  LogSourceType,
} from "../../domain/entities/log-source.entity";
import { InMemoryLogEntryRepository } from "../../infra/in-memory-log-entry.repository";
import { InMemoryLogSourceRepository } from "../../infra/in-memory-log-source.repository";
import { PrometheusLogCollector } from "../../infra/prometheus-log-collector.adapter";
import { LogEntryMapper } from "../../mappers/log-entry.mapper";
import { CollectLogsUseCase } from "../../use-cases/collect-logs.usecase";

describe("CollectLogsUseCase", () => {
  let useCase: CollectLogsUseCase;
  let sourceRepository: InMemoryLogSourceRepository;
  let entryRepository: InMemoryLogEntryRepository;
  let source: LogSource;

  beforeEach(async () => {
    container.clearInstances();
    sourceRepository = new InMemoryLogSourceRepository();
    entryRepository = new InMemoryLogEntryRepository();
    const collector = new PrometheusLogCollector(sourceRepository);
    const mapper = new LogEntryMapper();

    container.registerInstance("ILogSourceRepository", sourceRepository);
    container.registerInstance("ILogCollector", collector);
    container.registerInstance("ILogEntryRepository", entryRepository);

    useCase = new CollectLogsUseCase(
      sourceRepository,
      collector,
      entryRepository,
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

  it("should collect logs successfully", async () => {
    const input = {
      sourceId: source.id,
      timeRange: {
        start: new Date(Date.now() - 3600000).toISOString(),
        end: new Date().toISOString(),
      },
    };

    const result = await useCase.execute(input);

    expect(result.count).toBeGreaterThan(0);
    expect(result.logs.length).toBe(result.count);
    expect(result.sourceId).toBe(source.id);
  });

  it("should throw error for non-existent source", async () => {
    const input = {
      sourceId: "non-existent-id",
      timeRange: {
        start: new Date(Date.now() - 3600000).toISOString(),
        end: new Date().toISOString(),
      },
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Log source with ID "non-existent-id" not found'
    );
  });

  it("should throw error for inactive source", async () => {
    source.deactivate();
    await sourceRepository.update(source);

    const input = {
      sourceId: source.id,
      timeRange: {
        start: new Date(Date.now() - 3600000).toISOString(),
        end: new Date().toISOString(),
      },
    };

    await expect(useCase.execute(input)).rejects.toThrow("is not active");
  });
});
