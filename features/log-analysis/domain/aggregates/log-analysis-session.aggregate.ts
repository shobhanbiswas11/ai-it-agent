import { injectable } from "tsyringe";
import { AnalysisResult } from "../entities/analysis-result.entity";
import { LogEntry } from "../entities/log-entry.entity";
import { LogSource } from "../entities/log-source.entity";
import { AnalysisCompletedEvent } from "../events/analysis-completed.event";
import { AnomalyDetectedEvent } from "../events/anomaly-detected.event";
import { LogCollectedEvent } from "../events/log-collected.event";
import { DetectionModelConfig } from "../value-objects/detection-model-config.vo";
import { TimeRange } from "../value-objects/time-range.vo";

export enum SessionStatus {
  PENDING = "PENDING",
  COLLECTING = "COLLECTING",
  ANALYZING = "ANALYZING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface LogAnalysisSessionProps {
  id: string;
  source: LogSource;
  timeRange: TimeRange;
  modelConfig: DetectionModelConfig;
  status: SessionStatus;
  logEntries: LogEntry[];
  analysisResult?: AnalysisResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class LogAnalysisSession {
  private props: LogAnalysisSessionProps;
  private domainEvents: any[] = [];

  constructor(props: LogAnalysisSessionProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("Session ID is required");
    }
    if (!this.props.source) {
      throw new Error("LogSource is required");
    }
    if (!this.props.timeRange) {
      throw new Error("TimeRange is required");
    }
    if (!this.props.modelConfig) {
      throw new Error("ModelConfig is required");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get source(): LogSource {
    return this.props.source;
  }

  get timeRange(): TimeRange {
    return this.props.timeRange;
  }

  get modelConfig(): DetectionModelConfig {
    return this.props.modelConfig;
  }

  get status(): SessionStatus {
    return this.props.status;
  }

  get logEntries(): LogEntry[] {
    return [...this.props.logEntries];
  }

  get analysisResult(): AnalysisResult | undefined {
    return this.props.analysisResult;
  }

  get error(): string | undefined {
    return this.props.error;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  getDomainEvents(): any[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  startCollecting(): void {
    if (this.props.status !== SessionStatus.PENDING) {
      throw new Error("Can only start collecting from PENDING status");
    }
    this.props.status = SessionStatus.COLLECTING;
    this.props.updatedAt = new Date();
  }

  addLogEntries(entries: LogEntry[]): void {
    if (this.props.status !== SessionStatus.COLLECTING) {
      throw new Error("Can only add log entries during COLLECTING status");
    }
    this.props.logEntries.push(...entries);
    this.props.updatedAt = new Date();

    // Emit domain event
    this.domainEvents.push(
      new LogCollectedEvent(this.props.id, this.props.source.id, entries.length)
    );
  }

  startAnalysis(): void {
    if (this.props.status !== SessionStatus.COLLECTING) {
      throw new Error("Must finish collecting before starting analysis");
    }
    if (this.props.logEntries.length === 0) {
      throw new Error("Cannot analyze with no log entries");
    }
    this.props.status = SessionStatus.ANALYZING;
    this.props.updatedAt = new Date();
  }

  completeAnalysis(result: AnalysisResult): void {
    if (this.props.status !== SessionStatus.ANALYZING) {
      throw new Error("Can only complete analysis from ANALYZING status");
    }
    this.props.analysisResult = result;
    this.props.status = SessionStatus.COMPLETED;
    this.props.updatedAt = new Date();

    // Emit domain events
    if (result.hasAnomalies()) {
      this.domainEvents.push(
        new AnomalyDetectedEvent(
          this.props.id,
          result.id,
          result.anomalies.length,
          result.hasCriticalAnomalies()
        )
      );
    }

    this.domainEvents.push(
      new AnalysisCompletedEvent(
        this.props.id,
        result.id,
        result.hasAnomalies()
      )
    );
  }

  fail(error: string): void {
    this.props.status = SessionStatus.FAILED;
    this.props.error = error;
    this.props.updatedAt = new Date();
  }

  isCompleted(): boolean {
    return this.props.status === SessionStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.props.status === SessionStatus.FAILED;
  }

  hasAnomalies(): boolean {
    return this.props.analysisResult?.hasAnomalies() ?? false;
  }

  toJSON(): LogAnalysisSessionProps {
    return {
      ...this.props,
      logEntries: [...this.props.logEntries],
    };
  }

  static create(
    source: LogSource,
    timeRange: TimeRange,
    modelConfig: DetectionModelConfig
  ): LogAnalysisSession {
    return new LogAnalysisSession({
      id: crypto.randomUUID(),
      source,
      timeRange,
      modelConfig,
      status: SessionStatus.PENDING,
      logEntries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
