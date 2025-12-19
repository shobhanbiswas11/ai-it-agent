import { injectable } from "tsyringe";

export interface LogSourceConfigProps {
  endpoint: string;
  credentials?: Record<string, string>;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  metadata?: Record<string, any>;
}

@injectable()
export class LogSourceConfig {
  private props: LogSourceConfigProps;

  constructor(props: LogSourceConfigProps) {
    this.props = {
      timeout: 30000,
      retryAttempts: 3,
      ...props,
    };
    this.validate();
  }

  private validate(): void {
    if (!this.props.endpoint) {
      throw new Error("Endpoint is required");
    }
    if (this.props.timeout && this.props.timeout <= 0) {
      throw new Error("Timeout must be positive");
    }
    if (this.props.retryAttempts && this.props.retryAttempts < 0) {
      throw new Error("Retry attempts cannot be negative");
    }
  }

  get endpoint(): string {
    return this.props.endpoint;
  }

  get credentials(): Record<string, string> | undefined {
    return this.props.credentials;
  }

  get headers(): Record<string, string> | undefined {
    return this.props.headers;
  }

  get queryParams(): Record<string, string> | undefined {
    return this.props.queryParams;
  }

  get timeout(): number {
    return this.props.timeout!;
  }

  get retryAttempts(): number {
    return this.props.retryAttempts!;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  equals(other: LogSourceConfig): boolean {
    return (
      this.props.endpoint === other.props.endpoint &&
      JSON.stringify(this.props.credentials) ===
        JSON.stringify(other.props.credentials)
    );
  }

  toJSON(): LogSourceConfigProps {
    return { ...this.props };
  }

  static create(
    endpoint: string,
    credentials?: Record<string, string>,
    headers?: Record<string, string>,
    queryParams?: Record<string, string>,
    timeout?: number,
    retryAttempts?: number
  ): LogSourceConfig {
    return new LogSourceConfig({
      endpoint,
      credentials,
      headers,
      queryParams,
      timeout,
      retryAttempts,
    });
  }
}
