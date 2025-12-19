import { injectable } from "tsyringe";
import { LogSource } from "../domain/entities/log-source.entity";
import { ILogSourceRepository } from "../ports/log-source.repository.port";

@injectable()
export class InMemoryLogSourceRepository implements ILogSourceRepository {
  private sources: Map<string, LogSource> = new Map();

  async save(source: LogSource): Promise<void> {
    this.sources.set(source.id, source);
  }

  async findById(id: string): Promise<LogSource | null> {
    return this.sources.get(id) || null;
  }

  async findAll(): Promise<LogSource[]> {
    return Array.from(this.sources.values());
  }

  async findByType(type: string): Promise<LogSource[]> {
    return Array.from(this.sources.values()).filter((s) => s.type === type);
  }

  async update(source: LogSource): Promise<void> {
    this.sources.set(source.id, source);
  }

  async delete(id: string): Promise<void> {
    this.sources.delete(id);
  }
}
