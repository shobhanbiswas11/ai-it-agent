import { LogSourceConnectionResponse } from "../dtos/log-source.dto";

export interface LogSourcePort {
  configure(config: Record<string, any>): void;
  testConnection(): Promise<LogSourceConnectionResponse>;
  fetchLogs(): Promise<{
    logs: string[];
    count: number;
  }>;
}

export const LogSourcePortKeys = {
  zabbix: Symbol("ZabbixLogSource"),
};
