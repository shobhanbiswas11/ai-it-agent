import { LogSourceConfig } from "../dtos/log-source.dto";
import { ILogSource } from "./log-source.port";

export interface ILogSourceFactory {
  getLogSource(config: LogSourceConfig): ILogSource;
}
