import { inject, injectable } from "tsyringe";
import { CreateLogSourceDTO, LogSourceDTO } from "../dtos/log-source.dto";
import { LogSourceMapper } from "../mappers/log-source.mapper";
import { ILogSourceRepository } from "../ports/log-source.repository.port";

@injectable()
export class RegisterLogSourceUseCase {
  constructor(
    @inject("ILogSourceRepository")
    private readonly logSourceRepository: ILogSourceRepository,
    private readonly mapper: LogSourceMapper
  ) {}

  async execute(dto: CreateLogSourceDTO): Promise<LogSourceDTO> {
    // Create domain entity
    const logSource = this.mapper.fromCreateDTO(dto);

    // Validate business rules
    const existing = await this.logSourceRepository.findAll();
    const duplicate = existing.find(
      (s) => s.name === logSource.name || s.endpoint === logSource.endpoint
    );

    if (duplicate) {
      throw new Error(
        `Log source with name "${logSource.name}" or endpoint "${logSource.endpoint}" already exists`
      );
    }

    // Save to repository
    await this.logSourceRepository.save(logSource);

    // Return DTO
    return this.mapper.toDTO(logSource);
  }
}
