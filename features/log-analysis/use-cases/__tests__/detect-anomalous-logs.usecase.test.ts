import { Log } from "../../domain/log.entity";
import { LogAnomalyDetectorPort } from "../../ports/log-anomaly-detector.port";
import { DetectAnomalousLogs } from "../detect-anomalous-logs.usecase";

describe("anomalous logs detection", () => {
  let mockedAnomalyDetector: Mocked<LogAnomalyDetectorPort>;

  beforeEach(() => {
    mockedAnomalyDetector = mock();
  });

  it("should detect anomalous logs and mark them", async () => {
    const logs = Array.from({ length: 3 }, (_, i) => {
      const log = new Log(`log${i + 1}`);
      log.markAnomalous = vi.fn();
      return log;
    });

    mockedAnomalyDetector.detectAnomalies.mockResolvedValue({
      anomalousLogs: [
        {
          log: "log2",
          originalIndex: 1,
          score: 0.95,
          reason: "High error rate",
        },
      ],
    });

    const detectAnomalousLogs = new DetectAnomalousLogs({
      create: () => mockedAnomalyDetector,
    } as any);
    const result = await detectAnomalousLogs.execute(logs);

    expect(mockedAnomalyDetector.detectAnomalies).toHaveBeenCalledWith({
      logs: ["log1", "log2", "log3"],
    });

    expect(logs[1].markAnomalous).toHaveBeenCalledWith({
      score: 0.95,
      reason: "High error rate",
    });
    expect(logs[0].markAnomalous).not.toHaveBeenCalled();
    expect(logs[2].markAnomalous).not.toHaveBeenCalled();
    expect(result).toBe(logs);
  });
});
