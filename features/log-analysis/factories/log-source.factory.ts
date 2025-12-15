import { inject, singleton } from "tsyringe";
import { LogSourceConfig } from "../dtos/log-source.dto";
import { ZabbixLogSource } from "../infra/zabbix-log-source.adapter";
import { LogSourcePort, LogSourcePortKeys } from "../ports/log-source.port";

@singleton()
export class LogSourceFactory {
  constructor(
    @inject(LogSourcePortKeys.zabbix) private _zabbixLogSource: ZabbixLogSource
  ) {}

  getLogSource(config: LogSourceConfig): LogSourcePort {
    switch (config.type) {
      case "zabbix":
        return this._zabbixLogSource;
      default:
        throw new Error(`Unknown log source type: ${(config as any).type}`);
    }
  }
}
