import { container } from "tsyringe";
import { beforeEach, describe, expect, it } from "vitest";
import { LogSourceType } from "../../domain/entities/log-source.entity";
import { InMemoryLogSourceRepository } from "../../infra/in-memory-log-source.repository";
import { LogSourceMapper } from "../../mappers/log-source.mapper";
import { RegisterLogSourceUseCase } from "../../use-cases/register-log-source.usecase";

describe("RegisterLogSourceUseCase", () => {
  let useCase: RegisterLogSourceUseCase;
  let repository: InMemoryLogSourceRepository;

  beforeEach(() => {
    container.clearInstances();
    repository = new InMemoryLogSourceRepository();
    const mapper = new LogSourceMapper();

    container.registerInstance("ILogSourceRepository", repository);
    useCase = new RegisterLogSourceUseCase(repository, mapper);
  });

  it("should register a new log source successfully", async () => {
    const dto = {
      name: "Prometheus Server",
      type: LogSourceType.PROMETHEUS,
      endpoint: "http://localhost:9090",
      credentials: { apiKey: "test-key" },
    };

    const result = await useCase.execute(dto);

    expect(result.id).toBeDefined();
    expect(result.name).toBe("Prometheus Server");
    expect(result.type).toBe(LogSourceType.PROMETHEUS);
    expect(result.endpoint).toBe("http://localhost:9090");
  });

  it("should throw error for duplicate name", async () => {
    const dto = {
      name: "Prometheus Server",
      type: LogSourceType.PROMETHEUS,
      endpoint: "http://localhost:9090",
    };

    await useCase.execute(dto);

    const duplicateDto = {
      name: "Prometheus Server",
      type: LogSourceType.ZABBIX,
      endpoint: "http://different:8080",
    };

    await expect(useCase.execute(duplicateDto)).rejects.toThrow(
      'Log source with name "Prometheus Server"'
    );
  });

  it("should throw error for duplicate endpoint", async () => {
    const dto = {
      name: "Prometheus Server",
      type: LogSourceType.PROMETHEUS,
      endpoint: "http://localhost:9090",
    };

    await useCase.execute(dto);

    const duplicateDto = {
      name: "Different Name",
      type: LogSourceType.PROMETHEUS,
      endpoint: "http://localhost:9090",
    };

    await expect(useCase.execute(duplicateDto)).rejects.toThrow(
      'endpoint "http://localhost:9090" already exists'
    );
  });
});
