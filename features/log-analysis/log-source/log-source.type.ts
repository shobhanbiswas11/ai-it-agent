import { ZodType } from "zod";

export type LogSourceConfig = Record<string, any>;
export type FetchLogParams = Record<string, any>;
export type FetchLogsResponse = {
  logs: string[];
  count: number;
};
export type LogSourceConnectionCheckResponse = {
  success: boolean;
  message?: string;
};

export interface LogSource {
  name: string;
  description: string;
  configSchema?: ZodType;
  fetchLogs(
    config: LogSourceConfig,
    params: FetchLogParams
  ): Promise<FetchLogsResponse>;
  checkConnection(
    config: LogSourceConfig
  ): Promise<LogSourceConnectionCheckResponse>;
}
