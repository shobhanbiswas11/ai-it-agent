import { LogSourceConnectionResponse } from "../dtos/log-source.dto";

export interface LogSourcePort {
  testConnection(): Promise<LogSourceConnectionResponse>;
  fetchLogs(): Promise<{
    logs: string[];
    count: number;
  }>;
}

export const LogSourcePortKeys = {
  zabbix: Symbol("ZabbixLogSource"),
};
