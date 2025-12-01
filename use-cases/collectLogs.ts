import { Log } from "../domain/log";
import { ILogFetcher } from "../ports/ILogFetcher";

export class CollectLogs {
  constructor(private _logSource: ILogFetcher) {}

  async execute() {
    return this._logSource
      .fetchLogs()
      .then((res) => res.logs.map((logStr) => new Log(logStr)));
  }
}
