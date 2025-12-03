import { injectable } from "tsyringe";
import { LogSourceConfig } from "../dtos/log-source.dto";
import { ILogSourceFactory } from "../ports/log-source.factory.port";
import { ZabbixLogSource } from "./zabbix-log-source.adapter";

@injectable()
export class LogSourceFactory implements ILogSourceFactory {
  getLogSource({ type, config }: LogSourceConfig) {
    switch (type) {
      case "zabbix":
        return new ZabbixLogSource(config);

      default:
        throw new Error(`Unsupported log source type: ${type}`);
    }
  }
}
