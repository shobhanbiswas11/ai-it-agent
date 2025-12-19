import {
  LogSourceStatus,
  LogSourceType,
} from "../domain/entities/log-source.entity";

export interface LogSourceDTO {
  id: string;
  name: string;
  type: LogSourceType;
  status: LogSourceStatus;
  endpoint: string;
  credentials?: Record<string, string>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogSourceDTO {
  name: string;
  type: LogSourceType;
  endpoint: string;
  credentials?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface UpdateLogSourceDTO {
  name?: string;
  endpoint?: string;
  credentials?: Record<string, string>;
  metadata?: Record<string, any>;
}
