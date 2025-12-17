import { LogSource } from "./log-source.type";
import { zabbixLogSource } from "./zabbix.log-source";

const registry = new Map<string, LogSource>();
const logSourceRegistry = {
  get(name: string): LogSource | undefined {
    return registry.get(name);
  },
  set(name: string, source: LogSource) {
    registry.set(name, source);
  },
  entries(): LogSource[] {
    return Array.from(registry.values());
  },
};
logSourceRegistry.set(zabbixLogSource.name, zabbixLogSource);

export { logSourceRegistry };
