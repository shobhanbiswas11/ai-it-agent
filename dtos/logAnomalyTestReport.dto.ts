export type LogAnomalyTestReportDTO =
  | {
      status: "success";
      logProcessed: number;
      anomaliesDetected: number;
      anomalies: {
        log: string;
        score?: number;
        reason?: string;
      }[];
    }
  | {
      status: "failure";
      errorMessage: string;
    };
