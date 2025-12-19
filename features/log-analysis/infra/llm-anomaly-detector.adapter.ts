import { injectable } from "tsyringe";
import {
  Anomaly,
  AnomalyType,
  Severity,
} from "../domain/entities/analysis-result.entity";
import { LogEntry, LogLevel } from "../domain/entities/log-entry.entity";
import { DetectionModelConfig } from "../domain/value-objects/detection-model-config.vo";
import { IAnomalyDetector } from "../ports/anomaly-detector.port";

@injectable()
export class LLMAnomalyDetector implements IAnomalyDetector {
  async analyze(
    logs: LogEntry[],
    config: DetectionModelConfig
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Mock LLM-based anomaly detection
    // In real implementation, would call LLM API (OpenAI, Anthropic, etc.)
    // to analyze log patterns and detect anomalies

    // Example prompt structure:
    // "Analyze these logs and identify any anomalies, unusual patterns, or potential issues..."

    // Mock detection logic
    const threshold = config.threshold || 0.7;

    // Check for error patterns
    const errorLogs = logs.filter(
      (log) => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL
    );
    if (errorLogs.length > logs.length * 0.1) {
      anomalies.push({
        type: AnomalyType.LLM_DETECTED,
        severity: Severity.HIGH,
        description: `High error rate detected: ${
          errorLogs.length
        } errors out of ${logs.length} logs (${(
          (errorLogs.length / logs.length) *
          100
        ).toFixed(1)}%)`,
        logEntryIds: errorLogs.map((log) => log.id),
        score: Math.min(errorLogs.length / logs.length / 0.1, 1),
        metadata: {
          model: config.llmModel,
          errorCount: errorLogs.length,
          totalLogs: logs.length,
        },
      });
    }

    // Check for repeated patterns (potential issues)
    const messageMap = new Map<string, LogEntry[]>();
    for (const log of logs) {
      const key = log.message.toLowerCase();
      if (!messageMap.has(key)) {
        messageMap.set(key, []);
      }
      messageMap.get(key)!.push(log);
    }

    for (const [message, entries] of messageMap.entries()) {
      if (entries.length > 5 && entries.length > logs.length * 0.15) {
        const score = Math.min(entries.length / logs.length / 0.15, 1);
        if (score > threshold) {
          anomalies.push({
            type: AnomalyType.PATTERN,
            severity: this.calculateSeverity(score),
            description: `Repeated log pattern detected: "${message}" appears ${entries.length} times`,
            logEntryIds: entries.map((e) => e.id),
            score,
            metadata: {
              model: config.llmModel,
              repetitionCount: entries.length,
              pattern: message,
            },
          });
        }
      }
    }

    // Check for time-based anomalies (sudden bursts)
    const timeWindows = this.groupByTimeWindows(logs, 60000); // 1-minute windows
    const avgLogsPerWindow = logs.length / timeWindows.length;
    for (const window of timeWindows) {
      if (window.logs.length > avgLogsPerWindow * 3) {
        const score = Math.min(window.logs.length / (avgLogsPerWindow * 3), 1);
        if (score > threshold) {
          anomalies.push({
            type: AnomalyType.FREQUENCY,
            severity: this.calculateSeverity(score),
            description: `Unusual log burst detected at ${window.timestamp.toISOString()}: ${
              window.logs.length
            } logs in 1 minute (avg: ${avgLogsPerWindow.toFixed(1)})`,
            logEntryIds: window.logs.map((l) => l.id),
            score,
            metadata: {
              model: config.llmModel,
              timestamp: window.timestamp.toISOString(),
              logCount: window.logs.length,
              average: avgLogsPerWindow,
            },
          });
        }
      }
    }

    return anomalies;
  }

  getModelType(): string {
    return "LLM_BASED";
  }

  private calculateSeverity(score: number): Severity {
    if (score >= 0.9) return Severity.CRITICAL;
    if (score >= 0.75) return Severity.HIGH;
    if (score >= 0.5) return Severity.MEDIUM;
    return Severity.LOW;
  }

  private groupByTimeWindows(
    logs: LogEntry[],
    windowMs: number
  ): Array<{ timestamp: Date; logs: LogEntry[] }> {
    if (logs.length === 0) return [];

    const sortedLogs = [...logs].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const windows: Array<{ timestamp: Date; logs: LogEntry[] }> = [];

    let currentWindow = {
      timestamp: new Date(
        Math.floor(sortedLogs[0].timestamp.getTime() / windowMs) * windowMs
      ),
      logs: [] as LogEntry[],
    };

    for (const log of sortedLogs) {
      const windowStart = new Date(
        Math.floor(log.timestamp.getTime() / windowMs) * windowMs
      );

      if (windowStart.getTime() !== currentWindow.timestamp.getTime()) {
        if (currentWindow.logs.length > 0) {
          windows.push(currentWindow);
        }
        currentWindow = { timestamp: windowStart, logs: [] };
      }

      currentWindow.logs.push(log);
    }

    if (currentWindow.logs.length > 0) {
      windows.push(currentWindow);
    }

    return windows;
  }
}
