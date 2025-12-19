import { injectable } from "tsyringe";

export enum AnomalyType {
  STATISTICAL = "STATISTICAL",
  PATTERN = "PATTERN",
  FREQUENCY = "FREQUENCY",
  THRESHOLD = "THRESHOLD",
  LLM_DETECTED = "LLM_DETECTED",
}

export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface Anomaly {
  type: AnomalyType;
  severity: Severity;
  description: string;
  logEntryIds: string[];
  score: number;
  metadata?: Record<string, any>;
}

export interface AnalysisResultProps {
  id: string;
  sessionId: string;
  sourceId: string;
  modelType: string;
  analyzedLogCount: number;
  anomalies: Anomaly[];
  summary: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}

@injectable()
export class AnalysisResult {
  private props: AnalysisResultProps;

  constructor(props: AnalysisResultProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("AnalysisResult ID is required");
    }
    if (!this.props.sessionId) {
      throw new Error("AnalysisResult sessionId is required");
    }
    if (!this.props.sourceId) {
      throw new Error("AnalysisResult sourceId is required");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  get sourceId(): string {
    return this.props.sourceId;
  }

  get modelType(): string {
    return this.props.modelType;
  }

  get analyzedLogCount(): number {
    return this.props.analyzedLogCount;
  }

  get anomalies(): Anomaly[] {
    return [...this.props.anomalies];
  }

  get summary(): string {
    return this.props.summary;
  }

  get startTime(): Date {
    return this.props.startTime;
  }

  get endTime(): Date {
    return this.props.endTime;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get criticalAnomalies(): Anomaly[] {
    return this.props.anomalies.filter((a) => a.severity === Severity.CRITICAL);
  }

  get highSeverityAnomalies(): Anomaly[] {
    return this.props.anomalies.filter(
      (a) => a.severity === Severity.HIGH || a.severity === Severity.CRITICAL
    );
  }

  hasAnomalies(): boolean {
    return this.props.anomalies.length > 0;
  }

  hasCriticalAnomalies(): boolean {
    return this.criticalAnomalies.length > 0;
  }

  addAnomaly(anomaly: Anomaly): void {
    this.props.anomalies.push(anomaly);
  }

  toJSON(): AnalysisResultProps {
    return { ...this.props };
  }

  static create(
    sessionId: string,
    sourceId: string,
    modelType: string,
    analyzedLogCount: number,
    anomalies: Anomaly[],
    summary: string,
    startTime: Date,
    endTime: Date
  ): AnalysisResult {
    return new AnalysisResult({
      id: crypto.randomUUID(),
      sessionId,
      sourceId,
      modelType,
      analyzedLogCount,
      anomalies,
      summary,
      startTime,
      endTime,
      createdAt: new Date(),
    });
  }
}
