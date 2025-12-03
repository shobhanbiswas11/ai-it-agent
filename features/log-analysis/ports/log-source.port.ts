import { LogSourceConnectionResponse } from "../dtos/log-source.dto";

export interface ILogSource {
  testConnection(): Promise<LogSourceConnectionResponse>;
  fetchLogs(): Promise<{
    logs: string[];
    count: number;
  }>;
}
