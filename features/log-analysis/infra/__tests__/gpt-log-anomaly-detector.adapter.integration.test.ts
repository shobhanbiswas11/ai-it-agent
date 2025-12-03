import "reflect-metadata";
import { GptLogAnomalyDetector } from "../gpt-log-anomaly-detector.adapter";

describe("GptLogAnomalyDetector Integration Test", () => {
  let detector: GptLogAnomalyDetector;

  beforeEach(() => {
    detector = new GptLogAnomalyDetector();
  });

  it("should detect anomalies in sample logs", async () => {
    // Arrange
    const sampleLogs = [
      "2025-12-03 10:00:00 INFO Application started successfully",
      "2025-12-03 10:00:01 INFO User logged in: user123",
      "2025-12-03 10:00:02 ERROR Database connection failed: timeout after 30s",
      "2025-12-03 10:00:03 INFO Processing request #1001",
      "2025-12-03 10:00:04 WARNING High memory usage detected: 95%",
      "2025-12-03 10:00:05 INFO Request completed successfully",
      "2025-12-03 10:00:06 CRITICAL Security alert: Multiple failed login attempts from 192.168.1.100",
      "2025-12-03 10:00:07 INFO Cache hit ratio: 87%",
    ];

    // Act
    const result = await detector.detectAnomalies({ logs: sampleLogs });
    console.log(result);

    // Assert
    expect(result).toHaveProperty("anomalousLogs");
    expect(Array.isArray(result.anomalousLogs)).toBe(true);
    expect(result.anomalousLogs.length).toBeGreaterThan(0);

    // Verify structure of detected anomalies
    result.anomalousLogs.forEach((anomaly) => {
      expect(anomaly).toHaveProperty("log");
      expect(anomaly).toHaveProperty("reason");
      expect(typeof anomaly.log).toBe("string");
      expect(typeof anomaly.reason).toBe("string");

      // Optional fields
      if (anomaly.originalIndex !== undefined) {
        expect(typeof anomaly.originalIndex).toBe("number");
      }
      if (anomaly.score !== undefined) {
        expect(typeof anomaly.score).toBe("number");
        expect(anomaly.score).toBeGreaterThanOrEqual(0);
        expect(anomaly.score).toBeLessThanOrEqual(1);
      }
    });

    // Verify that errors and critical issues are detected
    const detectedLogs = result.anomalousLogs.map((a) => a.log);
    const hasError = detectedLogs.some(
      (log) =>
        log.includes("ERROR") ||
        log.includes("CRITICAL") ||
        log.includes("WARNING")
    );
    expect(hasError).toBe(true);
  }, 30000);
});
