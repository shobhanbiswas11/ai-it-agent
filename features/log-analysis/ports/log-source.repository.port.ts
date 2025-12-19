import { LogSource } from "../domain/entities/log-source.entity";

export interface ILogSourceRepository {
  save(source: LogSource): Promise<void>;
  findById(id: string): Promise<LogSource | null>;
  findAll(): Promise<LogSource[]>;
  findByType(type: string): Promise<LogSource[]>;
  update(source: LogSource): Promise<void>;
  delete(id: string): Promise<void>;
}
