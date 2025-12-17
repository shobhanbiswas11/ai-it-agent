import { inject, singleton } from "tsyringe";
import { LogSourceConfig } from "../domain/log-source.entity";
import { LogSourcePort, LogSourcePortKeys } from "../ports/log-source.port";

@singleton()
export class LogSourceFactory {
  constructor(
    @inject(LogSourcePortKeys.zabbix) private _zabbixLogSource: LogSourcePort
  ) {}

  create(type: string, config: LogSourceConfig): LogSourcePort {
    switch (type) {
      case "zabbix":
        this._zabbixLogSource.configure(config);
        return this._zabbixLogSource;
      default:
        throw new Error(`Unknown log source type: ${(config as any).type}`);
    }
  }
}
