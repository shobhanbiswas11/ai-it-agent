import { ILogAnomalyDetector } from "../../ports/ILogAnomalyDetector";
import { ILogSource } from "../../ports/ILogSource";
import { TestLogAnomalyDetection } from "../testLogAnomalyDetection";

describe("test log anomaly detection", () => {
  it("should take first 50 logs and run anomaly detection", async () => {
    // Mocks
    const mockLogs = Array.from({ length: 100 }, (_, i) => `log-${i + 1}`);
    const mockAnomalies = {
      anomalousLogs: [
        { log: "log-3", score: 0.95, reason: "High error rate" },
        { log: "log-27", score: 0.89, reason: "Unexpected pattern" },
      ],
    };

    const logSource: jest.Mocked<ILogSource> = {
      fetchLogs: jest
        .fn()
        .mockResolvedValue({ logs: mockLogs, count: mockLogs.length }),
      testConnection: jest.fn(),
    };

    const anomalyDetector: jest.Mocked<ILogAnomalyDetector> = {
      detectAnomalies: jest.fn().mockResolvedValue(mockAnomalies),
    };

    const testLogAnomalyDetection = new TestLogAnomalyDetection(
      { getLogSource: () => logSource },
      anomalyDetector
    );

    // Execute
    const report = await testLogAnomalyDetection.execute({} as any);

    // Assertions
    expect(logSource.fetchLogs).toHaveBeenCalledTimes(1);
    expect(anomalyDetector.detectAnomalies).toHaveBeenCalledWith({
      logs: mockLogs.slice(0, 50),
    });

    expect(report).toEqual({
      status: "success",
      logProcessed: 50,
      anomaliesDetected: 2,
      anomalies: [
        { log: "log-3", score: 0.95, reason: "High error rate" },
        { log: "log-27", score: 0.89, reason: "Unexpected pattern" },
      ],
    });
  });
});
