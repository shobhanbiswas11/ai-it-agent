import { inject, injectable } from "tsyringe";
import { LogSourceConfig } from "../dtos/log-source.dto";
import { ILogSourceFactory } from "../ports/log-source.factory.port";

@injectable()
export class CheckLogSourceConnection {
  constructor(
    @inject("ILogSourceFactory") private logSourceFactory: ILogSourceFactory
  ) {}
  execute(config: LogSourceConfig) {
    const logSource = this.logSourceFactory.getLogSource(config);
    return logSource.testConnection();
  }
}
