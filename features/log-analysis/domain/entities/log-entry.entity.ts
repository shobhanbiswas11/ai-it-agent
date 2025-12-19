import { injectable } from "tsyringe";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

export interface LogEntryProps {
  id: string;
  sourceId: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  rawContent: string;
  metadata?: Record<string, any>;
  tags?: string[];
  collectedAt: Date;
}

@injectable()
export class LogEntry {
  private props: LogEntryProps;

  constructor(props: LogEntryProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("LogEntry ID is required");
    }
    if (!this.props.sourceId) {
      throw new Error("LogEntry sourceId is required");
    }
    if (!this.props.timestamp) {
      throw new Error("LogEntry timestamp is required");
    }
    if (!this.props.message) {
      throw new Error("LogEntry message is required");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get sourceId(): string {
    return this.props.sourceId;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get level(): LogLevel {
    return this.props.level;
  }

  get message(): string {
    return this.props.message;
  }

  get rawContent(): string {
    return this.props.rawContent;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get tags(): string[] | undefined {
    return this.props.tags;
  }

  get collectedAt(): Date {
    return this.props.collectedAt;
  }

  addTag(tag: string): void {
    if (!this.props.tags) {
      this.props.tags = [];
    }
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
    }
  }

  addMetadata(key: string, value: any): void {
    if (!this.props.metadata) {
      this.props.metadata = {};
    }
    this.props.metadata[key] = value;
  }

  toJSON(): LogEntryProps {
    return { ...this.props };
  }

  static create(
    sourceId: string,
    timestamp: Date,
    level: LogLevel,
    message: string,
    rawContent: string,
    metadata?: Record<string, any>,
    tags?: string[]
  ): LogEntry {
    return new LogEntry({
      id: crypto.randomUUID(),
      sourceId,
      timestamp,
      level,
      message,
      rawContent,
      metadata,
      tags,
      collectedAt: new Date(),
    });
  }
}
