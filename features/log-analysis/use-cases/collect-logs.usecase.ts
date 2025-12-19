import { inject, injectable } from "tsyringe";
import { TimeRange } from "../domain/value-objects/time-range.vo";
import { LogEntryDTO } from "../dtos/log-entry.dto";
import { LogEntryMapper } from "../mappers/log-entry.mapper";
import { ILogCollector } from "../ports/log-collector.port";
import { ILogEntryRepository } from "../ports/log-entry.repository.port";
import { ILogSourceRepository } from "../ports/log-source.repository.port";

export interface CollectLogsInput {
  sourceId: string;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface CollectLogsOutput {
  logs: LogEntryDTO[];
  count: number;
  sourceId: string;
  timeRange: {
    start: string;
    end: string;
  };
}

@injectable()
export class CollectLogsUseCase {
  constructor(
    @inject("ILogSourceRepository")
    private readonly logSourceRepository: ILogSourceRepository,
    @inject("ILogCollector")
    private readonly logCollector: ILogCollector,
    @inject("ILogEntryRepository")
    private readonly logEntryRepository: ILogEntryRepository,
    private readonly mapper: LogEntryMapper
  ) {}

  async execute(input: CollectLogsInput): Promise<CollectLogsOutput> {
    // Find log source
    const source = await this.logSourceRepository.findById(input.sourceId);
    if (!source) {
      throw new Error(`Log source with ID "${input.sourceId}" not found`);
    }

    // Validate source is active
    if (source.status !== "ACTIVE") {
      throw new Error(`Log source "${source.name}" is not active`);
    }

    // Create time range value object
    const timeRange = TimeRange.create(
      new Date(input.timeRange.start),
      new Date(input.timeRange.end)
    );

    try {
      // Collect logs from source
      const logs = await this.logCollector.collect(input.sourceId, timeRange);

      // Save logs to repository
      if (logs.length > 0) {
        await this.logEntryRepository.saveBatch(logs);
      }

      // Return result
      return {
        logs: this.mapper.toDTOList(logs),
        count: logs.length,
        sourceId: input.sourceId,
        timeRange: input.timeRange,
      };
    } catch (error) {
      // Mark source as error if collection fails
      source.markAsError();
      await this.logSourceRepository.update(source);
      throw new Error(
        `Failed to collect logs from source "${source.name}": ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
