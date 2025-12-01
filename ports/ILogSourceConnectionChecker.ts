export interface ILogSourceConnectionChecker {
  checkConnection(): Promise<{
    success: boolean;
    message?: string;
  }>;
}
