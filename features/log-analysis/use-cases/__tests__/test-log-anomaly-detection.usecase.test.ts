import { LogAnomalyDetectorPort } from "../../ports/log-anomaly-detector.port";
import { LogSourcePort } from "../../ports/log-source.port";
import { TestLogAnomalyDetection } from "../test-log-anomaly-detection.usecase";

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

    // Arrange
    let mockedLogSource = mock<LogSourcePort>();
    let mockedAnomalyDetector = mock<LogAnomalyDetectorPort>();

    mockedLogSource.fetchLogs.mockResolvedValue({ logs: mockLogs, count: 100 });
    mockedAnomalyDetector.detectAnomalies.mockResolvedValue(
      mockAnomalies as any
    );

    const testLogAnomalyDetection = new TestLogAnomalyDetection(
      { create: () => mockedLogSource } as any,
      { create: () => mockedAnomalyDetector } as any
    );

    // Execute
    const report = await testLogAnomalyDetection.execute({} as any);

    // Assertions
    expect(mockedLogSource.fetchLogs).toHaveBeenCalledTimes(1);
    expect(mockedAnomalyDetector.detectAnomalies).toHaveBeenCalledWith({
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
