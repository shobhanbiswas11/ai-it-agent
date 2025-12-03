import { Log } from "../../domain/log.entity";
import { ILogAnomalyDetector } from "../../ports/ILogAnomalyDetector";
import { DetectAnomalousLogs } from "../detectAnomalousLogs";

describe("anomalous logs detection", () => {
  let anomalyDetector: jest.Mocked<ILogAnomalyDetector>;
  beforeEach(() => {
    anomalyDetector = {
      detectAnomalies: jest.fn(),
    } as jest.Mocked<ILogAnomalyDetector>;
  });

  it("should detect anomalous logs and mark them", async () => {
    const logs = Array.from({ length: 3 }, (_, i) => {
      const log = new Log(`log${i + 1}`);
      log.markAnomalous = jest.fn();
      return log;
    });

    anomalyDetector.detectAnomalies.mockResolvedValue({
      anomalousLogs: [
        {
          log: "log2",
          originalIndex: 1,
          score: 0.95,
          reason: "High error rate",
        },
      ],
    });

    const detectAnomalousLogs = new DetectAnomalousLogs(anomalyDetector);
    const result = await detectAnomalousLogs.execute(logs);

    expect(anomalyDetector.detectAnomalies).toHaveBeenCalledWith({
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
