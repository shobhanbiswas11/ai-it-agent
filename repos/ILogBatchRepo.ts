import { LogBatch } from "../domain/log-batch";

export interface ILogBatchRepo {
  saveMany(logBatches: LogBatch[]): Promise<void>;
  findById(jobId: string): Promise<LogBatch | null>;
}
