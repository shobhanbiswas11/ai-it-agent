import { describe, expect, it } from "vitest";
import {
  LogSource,
  LogSourceStatus,
  LogSourceType,
} from "../../domain/entities/log-source.entity";

describe("LogSource Entity", () => {
  describe("create", () => {
    it("should create a new log source with valid data", () => {
      const source = LogSource.create(
        "Test Source",
        LogSourceType.PROMETHEUS,
        "http://localhost:9090",
        { apiKey: "test-key" },
        { region: "us-east-1" }
      );

      expect(source.id).toBeDefined();
      expect(source.name).toBe("Test Source");
      expect(source.type).toBe(LogSourceType.PROMETHEUS);
      expect(source.endpoint).toBe("http://localhost:9090");
      expect(source.status).toBe(LogSourceStatus.INACTIVE);
      expect(source.credentials).toEqual({ apiKey: "test-key" });
      expect(source.metadata).toEqual({ region: "us-east-1" });
    });

    it("should throw error when name is empty", () => {
      expect(() => {
        new LogSource({
          id: "123",
          name: "",
          type: LogSourceType.PROMETHEUS,
          status: LogSourceStatus.ACTIVE,
          endpoint: "http://localhost:9090",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow("LogSource name is required");
    });

    it("should throw error when endpoint is empty", () => {
      expect(() => {
        new LogSource({
          id: "123",
          name: "Test",
          type: LogSourceType.PROMETHEUS,
          status: LogSourceStatus.ACTIVE,
          endpoint: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow("LogSource endpoint is required");
    });
  });

  describe("activate", () => {
    it("should change status to ACTIVE", () => {
      const source = LogSource.create(
        "Test Source",
        LogSourceType.PROMETHEUS,
        "http://localhost:9090"
      );

      source.activate();

      expect(source.status).toBe(LogSourceStatus.ACTIVE);
    });
  });

  describe("deactivate", () => {
    it("should change status to INACTIVE", () => {
      const source = LogSource.create(
        "Test Source",
        LogSourceType.PROMETHEUS,
        "http://localhost:9090"
      );
      source.activate();

      source.deactivate();

      expect(source.status).toBe(LogSourceStatus.INACTIVE);
    });
  });

  describe("markAsError", () => {
    it("should change status to ERROR", () => {
      const source = LogSource.create(
        "Test Source",
        LogSourceType.PROMETHEUS,
        "http://localhost:9090"
      );

      source.markAsError();

      expect(source.status).toBe(LogSourceStatus.ERROR);
    });
  });

  describe("updateEndpoint", () => {
    it("should update endpoint successfully", () => {
      const source = LogSource.create(
        "Test Source",
        LogSourceType.PROMETHEUS,
        "http://localhost:9090"
      );

      source.updateEndpoint("http://newhost:9090");

      expect(source.endpoint).toBe("http://newhost:9090");
    });

    it("should throw error when endpoint is empty", () => {
      const source = LogSource.create(
        "Test Source",
        LogSourceType.PROMETHEUS,
        "http://localhost:9090"
      );

      expect(() => {
        source.updateEndpoint("");
      }).toThrow("Endpoint cannot be empty");
    });
  });

  describe("updateCredentials", () => {
    it("should update credentials successfully", () => {
      const source = LogSource.create(
        "Test Source",
        LogSourceType.PROMETHEUS,
        "http://localhost:9090"
      );

      const newCredentials = { apiKey: "new-key", secret: "secret" };
      source.updateCredentials(newCredentials);

      expect(source.credentials).toEqual(newCredentials);
    });
  });

  describe("toJSON", () => {
    it("should return JSON representation", () => {
      const source = LogSource.create(
        "Test Source",
        LogSourceType.PROMETHEUS,
        "http://localhost:9090"
      );

      const json = source.toJSON();

      expect(json.id).toBe(source.id);
      expect(json.name).toBe("Test Source");
      expect(json.type).toBe(LogSourceType.PROMETHEUS);
    });
  });
});
