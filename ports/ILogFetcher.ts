interface FetchLogFilter {}

export interface ILogFetcher {
  fetchLogs(filter?: FetchLogFilter): Promise<{
    logs: string[];
    count: number;
  }>;
}
