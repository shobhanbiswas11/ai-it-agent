import { Job } from "../domain/job";
import { ILogAnomalyDetector } from "../ports/ILogAnomalyDetector";
import { ILogFetcher } from "../ports/ILogFetcher";
import { CollectLogs } from "../use-cases/collectLogs";
import { DetectAnomalousLogs } from "../use-cases/detectAnomalousLogs";

const logFetcher: ILogFetcher = {
  fetchLogs: async () => {
    return { logs: ["log-1", "log-2"], count: 0 };
  },
};

const objectSaver = {
  save: async (path: string, data: Buffer) => {
    console.log(`Saved data to ${path}`);
  },
};

const logAnomalyDetector: ILogAnomalyDetector = {
  detectAnomalies: async ({ logs }) => {
    return {
      anomalousLogs: [
        {
          log: "log-1",
          reason: "Contains error keyword",
          originalIndex: 0,
          score: 0.95,
        },
      ],
    };
  },
};

export async function detectLogAnomaly() {
  const job = new Job("job-1");
  const collectLogs = new CollectLogs(logFetcher);
  const detectLogAnomaly = new DetectAnomalousLogs(logAnomalyDetector);

  const logs = await collectLogs.execute();

  for (let i = 0; i < logs.length; i += 50) {
    const batch = logs.slice(i, i + 50);
  }
}
