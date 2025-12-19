import { injectable } from "tsyringe";
import { LogSource } from "../domain/entities/log-source.entity";
import { CreateLogSourceDTO, LogSourceDTO } from "../dtos/log-source.dto";

@injectable()
export class LogSourceMapper {
  toDTO(entity: LogSource): LogSourceDTO {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      status: entity.status,
      endpoint: entity.endpoint,
      credentials: entity.credentials,
      metadata: entity.metadata,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  toDTOList(entities: LogSource[]): LogSourceDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }

  toEntity(dto: LogSourceDTO): LogSource {
    return new LogSource({
      id: dto.id,
      name: dto.name,
      type: dto.type,
      status: dto.status,
      endpoint: dto.endpoint,
      credentials: dto.credentials,
      metadata: dto.metadata,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  fromCreateDTO(dto: CreateLogSourceDTO): LogSource {
    return LogSource.create(
      dto.name,
      dto.type,
      dto.endpoint,
      dto.credentials,
      dto.metadata
    );
  }
}
