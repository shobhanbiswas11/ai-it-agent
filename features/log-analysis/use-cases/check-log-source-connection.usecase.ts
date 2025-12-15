import { singleton } from "tsyringe";
import { LogSourceConfig } from "../dtos/log-source.dto";
import { LogSourceFactory } from "../factories/log-source.factory";

@singleton()
export class CheckLogSourceConnection {
  constructor(private _logSourceFactory: LogSourceFactory) {}
  execute(config: LogSourceConfig) {
    const logSource = this._logSourceFactory.getLogSource(config);
    return logSource.testConnection();
  }
}
