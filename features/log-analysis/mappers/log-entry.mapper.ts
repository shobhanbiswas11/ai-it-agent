import { injectable } from "tsyringe";
import { LogEntry } from "../domain/entities/log-entry.entity";
import { CreateLogEntryDTO, LogEntryDTO } from "../dtos/log-entry.dto";

@injectable()
export class LogEntryMapper {
  toDTO(entity: LogEntry): LogEntryDTO {
    return {
      id: entity.id,
      sourceId: entity.sourceId,
      timestamp: entity.timestamp.toISOString(),
      level: entity.level,
      message: entity.message,
      rawContent: entity.rawContent,
      metadata: entity.metadata,
      tags: entity.tags,
      collectedAt: entity.collectedAt.toISOString(),
    };
  }

  toDTOList(entities: LogEntry[]): LogEntryDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }

  toEntity(dto: LogEntryDTO): LogEntry {
    return new LogEntry({
      id: dto.id,
      sourceId: dto.sourceId,
      timestamp: new Date(dto.timestamp),
      level: dto.level,
      message: dto.message,
      rawContent: dto.rawContent,
      metadata: dto.metadata,
      tags: dto.tags,
      collectedAt: new Date(dto.collectedAt),
    });
  }

  fromCreateDTO(dto: CreateLogEntryDTO): LogEntry {
    return LogEntry.create(
      dto.sourceId,
      new Date(dto.timestamp),
      dto.level,
      dto.message,
      dto.rawContent,
      dto.metadata,
      dto.tags
    );
  }
}
