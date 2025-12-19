import { LogLevel } from "../domain/entities/log-entry.entity";

export interface LogEntryDTO {
  id: string;
  sourceId: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  rawContent: string;
  metadata?: Record<string, any>;
  tags?: string[];
  collectedAt: string;
}

export interface CreateLogEntryDTO {
  sourceId: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  rawContent: string;
  metadata?: Record<string, any>;
  tags?: string[];
}
