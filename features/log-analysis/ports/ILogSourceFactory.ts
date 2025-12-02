import { LogSourceConfig } from "../dtos/log-source.dto";
import { ILogSource } from "./ILogSource";

export interface ILogSourceFactory {
  getLogSource(config: LogSourceConfig): ILogSource;
}
