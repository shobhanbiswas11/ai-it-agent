import { injectable } from "tsyringe";

export enum LogSourceType {
  PROMETHEUS = "PROMETHEUS",
  ZABBIX = "ZABBIX",
  CUSTOM = "CUSTOM",
}

export enum LogSourceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
}

export interface LogSourceProps {
  id: string;
  name: string;
  type: LogSourceType;
  status: LogSourceStatus;
  endpoint: string;
  credentials?: Record<string, string>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class LogSource {
  private props: LogSourceProps;

  constructor(props: LogSourceProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("LogSource ID is required");
    }
    if (!this.props.name) {
      throw new Error("LogSource name is required");
    }
    if (!this.props.endpoint) {
      throw new Error("LogSource endpoint is required");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): LogSourceType {
    return this.props.type;
  }

  get status(): LogSourceStatus {
    return this.props.status;
  }

  get endpoint(): string {
    return this.props.endpoint;
  }

  get credentials(): Record<string, string> | undefined {
    return this.props.credentials;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  activate(): void {
    this.props.status = LogSourceStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.status = LogSourceStatus.INACTIVE;
    this.props.updatedAt = new Date();
  }

  markAsError(): void {
    this.props.status = LogSourceStatus.ERROR;
    this.props.updatedAt = new Date();
  }

  updateEndpoint(endpoint: string): void {
    if (!endpoint) {
      throw new Error("Endpoint cannot be empty");
    }
    this.props.endpoint = endpoint;
    this.props.updatedAt = new Date();
  }

  updateCredentials(credentials: Record<string, string>): void {
    this.props.credentials = credentials;
    this.props.updatedAt = new Date();
  }

  toJSON(): LogSourceProps {
    return { ...this.props };
  }

  static create(
    name: string,
    type: LogSourceType,
    endpoint: string,
    credentials?: Record<string, string>,
    metadata?: Record<string, any>
  ): LogSource {
    return new LogSource({
      id: crypto.randomUUID(),
      name,
      type,
      status: LogSourceStatus.INACTIVE,
      endpoint,
      credentials,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
