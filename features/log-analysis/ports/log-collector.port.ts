import { LogEntry } from "../domain/entities/log-entry.entity";
import { TimeRange } from "../domain/value-objects/time-range.vo";

export interface ILogCollector {
  /**
   * Collect logs from a source within a time range
   */
  collect(sourceId: string, timeRange: TimeRange): Promise<LogEntry[]>;

  /**
   * Test connection to the log source
   */
  testConnection(sourceId: string): Promise<boolean>;
}
