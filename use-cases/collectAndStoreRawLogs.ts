import { Job } from "../domain/job";
import { ILogFetcher } from "../ports/ILogFetcher";
import { IObjectSaver } from "../ports/IObjectSaver";

export class CollectAndStoreRawLogs {
  private _BATCH_SIZE = 100;

  constructor(
    private _logFetcher: ILogFetcher,
    private _objectStorage: IObjectSaver,
    private _job: Job
  ) {}

  async execute(): Promise<void> {
    const res = await this._logFetcher.fetchLogs();
    const batches: string[][] = [];

    // Create batches from raw logs
    for (let i = 0; i < res.logs.length; i += this._BATCH_SIZE) {
      const batch = res.logs.slice(i, i + this._BATCH_SIZE);
      batches.push(batch);
    }

    const processingTime = Date.now();

    // save each batch in object storage
    for (let index = 0; index < batches.length; index++) {
      const batch = batches[index];

      const key = `jobs/${this._job.id}/batches/${processingTime}/${
        index + 1
      }.json`;
      const dataBuffer = Buffer.from(JSON.stringify(batch), "utf-8");
      await this._objectStorage.save(key, dataBuffer);
    }
  }
}
