import { beforeEach, describe, expect, it } from "vitest";
import {
  LogAnalysisSession,
  SessionStatus,
} from "../../domain/aggregates/log-analysis-session.aggregate";
import {
  AnalysisResult,
  AnomalyType,
  Severity,
} from "../../domain/entities/analysis-result.entity";
import { LogEntry, LogLevel } from "../../domain/entities/log-entry.entity";
import {
  LogSource,
  LogSourceType,
} from "../../domain/entities/log-source.entity";
import { DetectionModelConfig } from "../../domain/value-objects/detection-model-config.vo";
import { TimeRange } from "../../domain/value-objects/time-range.vo";

describe("LogAnalysisSession Aggregate", () => {
  let source: LogSource;
  let timeRange: TimeRange;
  let modelConfig: DetectionModelConfig;

  beforeEach(() => {
    source = LogSource.create(
      "Test Source",
      LogSourceType.PROMETHEUS,
      "http://localhost:9090"
    );
    source.activate();
    timeRange = TimeRange.lastHour();
    modelConfig = DetectionModelConfig.createLLM("gpt-4", undefined, 0.7);
  });

  describe("create", () => {
    it("should create a new session with PENDING status", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);

      expect(session.id).toBeDefined();
      expect(session.status).toBe(SessionStatus.PENDING);
      expect(session.source).toBe(source);
      expect(session.timeRange).toBe(timeRange);
      expect(session.modelConfig).toBe(modelConfig);
      expect(session.logEntries).toHaveLength(0);
    });
  });

  describe("startCollecting", () => {
    it("should change status to COLLECTING", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);

      session.startCollecting();

      expect(session.status).toBe(SessionStatus.COLLECTING);
    });

    it("should throw error if not in PENDING status", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);
      session.startCollecting();

      expect(() => {
        session.startCollecting();
      }).toThrow("Can only start collecting from PENDING status");
    });
  });

  describe("addLogEntries", () => {
    it("should add log entries and emit event", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);
      session.startCollecting();

      const logs = [
        LogEntry.create(
          source.id,
          new Date(),
          LogLevel.INFO,
          "Test log 1",
          "raw1"
        ),
        LogEntry.create(
          source.id,
          new Date(),
          LogLevel.INFO,
          "Test log 2",
          "raw2"
        ),
      ];

      session.addLogEntries(logs);

      expect(session.logEntries).toHaveLength(2);
      expect(session.getDomainEvents()).toHaveLength(1);
      expect(session.getDomainEvents()[0].eventType).toBe("LogCollected");
    });

    it("should throw error if not in COLLECTING status", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);
      const logs = [
        LogEntry.create(source.id, new Date(), LogLevel.INFO, "Test", "raw"),
      ];

      expect(() => {
        session.addLogEntries(logs);
      }).toThrow("Can only add log entries during COLLECTING status");
    });
  });

  describe("startAnalysis", () => {
    it("should change status to ANALYZING", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);
      session.startCollecting();
      const logs = [
        LogEntry.create(source.id, new Date(), LogLevel.INFO, "Test", "raw"),
      ];
      session.addLogEntries(logs);

      session.startAnalysis();

      expect(session.status).toBe(SessionStatus.ANALYZING);
    });

    it("should throw error if no log entries", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);
      session.startCollecting();

      expect(() => {
        session.startAnalysis();
      }).toThrow("Cannot analyze with no log entries");
    });
  });

  describe("completeAnalysis", () => {
    it("should complete analysis and emit events", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);
      session.startCollecting();
      const logs = [
        LogEntry.create(source.id, new Date(), LogLevel.ERROR, "Error", "raw"),
      ];
      session.addLogEntries(logs);
      session.clearDomainEvents();
      session.startAnalysis();

      const result = AnalysisResult.create(
        session.id,
        source.id,
        "LLM",
        1,
        [
          {
            type: AnomalyType.LLM_DETECTED,
            severity: Severity.HIGH,
            description: "Test anomaly",
            logEntryIds: [logs[0].id],
            score: 0.9,
          },
        ],
        "Test summary",
        timeRange.start,
        timeRange.end
      );

      session.completeAnalysis(result);

      expect(session.status).toBe(SessionStatus.COMPLETED);
      expect(session.analysisResult).toBe(result);
      expect(session.getDomainEvents()).toHaveLength(2); // AnomalyDetected + AnalysisCompleted
    });
  });

  describe("fail", () => {
    it("should mark session as failed with error", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);

      session.fail("Connection timeout");

      expect(session.status).toBe(SessionStatus.FAILED);
      expect(session.error).toBe("Connection timeout");
      expect(session.isFailed()).toBe(true);
    });
  });

  describe("hasAnomalies", () => {
    it("should return true when analysis has anomalies", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);
      session.startCollecting();
      const logs = [
        LogEntry.create(source.id, new Date(), LogLevel.ERROR, "Error", "raw"),
      ];
      session.addLogEntries(logs);
      session.startAnalysis();

      const result = AnalysisResult.create(
        session.id,
        source.id,
        "LLM",
        1,
        [
          {
            type: AnomalyType.LLM_DETECTED,
            severity: Severity.HIGH,
            description: "Test",
            logEntryIds: [],
            score: 0.9,
          },
        ],
        "Summary",
        timeRange.start,
        timeRange.end
      );

      session.completeAnalysis(result);

      expect(session.hasAnomalies()).toBe(true);
    });

    it("should return false when no analysis result", () => {
      const session = LogAnalysisSession.create(source, timeRange, modelConfig);

      expect(session.hasAnomalies()).toBe(false);
    });
  });
});
