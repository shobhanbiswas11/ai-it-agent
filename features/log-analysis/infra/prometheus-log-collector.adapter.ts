import { inject, injectable } from "tsyringe";
import { LogEntry, LogLevel } from "../domain/entities/log-entry.entity";
import { LogSourceType } from "../domain/entities/log-source.entity";
import { TimeRange } from "../domain/value-objects/time-range.vo";
import { ILogCollector } from "../ports/log-collector.port";
import { ILogSourceRepository } from "../ports/log-source.repository.port";

@injectable()
export class PrometheusLogCollector implements ILogCollector {
  constructor(
    @inject("ILogSourceRepository")
    private readonly logSourceRepository: ILogSourceRepository
  ) {}

  async collect(sourceId: string, timeRange: TimeRange): Promise<LogEntry[]> {
    const source = await this.logSourceRepository.findById(sourceId);
    if (!source || source.type !== LogSourceType.PROMETHEUS) {
      throw new Error("Invalid Prometheus source");
    }

    // Mock implementation - in real scenario, would call Prometheus API
    // Example: query_range API with PromQL queries
    const logs: LogEntry[] = [];

    // Simulate collecting logs
    const mockLogCount = Math.floor(Math.random() * 20) + 10;
    for (let i = 0; i < mockLogCount; i++) {
      const timestamp = new Date(
        timeRange.start.getTime() +
          Math.random() * (timeRange.end.getTime() - timeRange.start.getTime())
      );

      const level = this.randomLogLevel();
      const message = this.generatePrometheusMessage(level);

      logs.push(
        LogEntry.create(
          sourceId,
          timestamp,
          level,
          message,
          JSON.stringify({
            metric: "sample_metric",
            value: Math.random() * 100,
          }),
          {
            collector: "prometheus",
            endpoint: source.endpoint,
          },
          ["prometheus", "metrics"]
        )
      );
    }

    return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async testConnection(sourceId: string): Promise<boolean> {
    const source = await this.logSourceRepository.findById(sourceId);
    if (!source || source.type !== LogSourceType.PROMETHEUS) {
      return false;
    }

    // Mock connection test - in real scenario, would ping Prometheus API
    try {
      // Example: GET /api/v1/status/config
      return true;
    } catch {
      return false;
    }
  }

  private randomLogLevel(): LogLevel {
    const levels = [
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.DEBUG,
    ];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private generatePrometheusMessage(level: LogLevel): string {
    const messages = {
      [LogLevel.INFO]: [
        "Metric scrape successful",
        "Target discovered",
        "Query executed successfully",
      ],
      [LogLevel.WARN]: [
        "Slow query detected",
        "High cardinality metric",
        "Memory usage above threshold",
      ],
      [LogLevel.ERROR]: [
        "Failed to scrape target",
        "Query timeout",
        "Storage write failed",
      ],
      [LogLevel.DEBUG]: [
        "Starting metric collection",
        "Processing time series data",
      ],
      [LogLevel.FATAL]: ["Critical system failure"],
    };

    const levelMessages = messages[level] || messages[LogLevel.INFO];
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  }
}
