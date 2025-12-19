import { inject, injectable } from "tsyringe";
import { LogEntry, LogLevel } from "../domain/entities/log-entry.entity";
import { LogSourceType } from "../domain/entities/log-source.entity";
import { TimeRange } from "../domain/value-objects/time-range.vo";
import { ILogCollector } from "../ports/log-collector.port";
import { ILogSourceRepository } from "../ports/log-source.repository.port";

@injectable()
export class ZabbixLogCollector implements ILogCollector {
  constructor(
    @inject("ILogSourceRepository")
    private readonly logSourceRepository: ILogSourceRepository
  ) {}

  async collect(sourceId: string, timeRange: TimeRange): Promise<LogEntry[]> {
    const source = await this.logSourceRepository.findById(sourceId);
    if (!source || source.type !== LogSourceType.ZABBIX) {
      throw new Error("Invalid Zabbix source");
    }

    // Mock implementation - in real scenario, would call Zabbix API
    // Example: history.get or event.get methods
    const logs: LogEntry[] = [];

    // Simulate collecting logs
    const mockLogCount = Math.floor(Math.random() * 25) + 15;
    for (let i = 0; i < mockLogCount; i++) {
      const timestamp = new Date(
        timeRange.start.getTime() +
          Math.random() * (timeRange.end.getTime() - timeRange.start.getTime())
      );

      const level = this.randomLogLevel();
      const message = this.generateZabbixMessage(level);

      logs.push(
        LogEntry.create(
          sourceId,
          timestamp,
          level,
          message,
          JSON.stringify({
            itemid: Math.floor(Math.random() * 10000),
            value: Math.random() * 100,
            host: "server-" + Math.floor(Math.random() * 10),
          }),
          {
            collector: "zabbix",
            endpoint: source.endpoint,
            severity: this.mapLevelToZabbixSeverity(level),
          },
          ["zabbix", "monitoring"]
        )
      );
    }

    return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async testConnection(sourceId: string): Promise<boolean> {
    const source = await this.logSourceRepository.findById(sourceId);
    if (!source || source.type !== LogSourceType.ZABBIX) {
      return false;
    }

    // Mock connection test - in real scenario, would call apiinfo.version
    try {
      // Example: POST /api_jsonrpc.php with apiinfo.version
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

  private generateZabbixMessage(level: LogLevel): string {
    const messages = {
      [LogLevel.INFO]: [
        "Item value updated",
        "Trigger activated",
        "Host monitoring started",
      ],
      [LogLevel.WARN]: [
        "Item became unsupported",
        "Response time degraded",
        "Disk space low",
      ],
      [LogLevel.ERROR]: [
        "Host unreachable",
        "Service check failed",
        "Critical threshold exceeded",
      ],
      [LogLevel.DEBUG]: [
        "Agent data received",
        "Processing trigger expression",
      ],
      [LogLevel.FATAL]: ["System critical failure", "Database connection lost"],
    };

    const levelMessages = messages[level] || messages[LogLevel.INFO];
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  }

  private mapLevelToZabbixSeverity(level: LogLevel): number {
    // Zabbix severity: 0=Not classified, 1=Info, 2=Warning, 3=Average, 4=High, 5=Disaster
    const mapping = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 4,
      [LogLevel.FATAL]: 5,
    };
    return mapping[level] || 0;
  }
}
