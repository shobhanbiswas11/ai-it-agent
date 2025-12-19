import { inject, injectable } from "tsyringe";
import { LogAnalysisSession } from "../domain/aggregates/log-analysis-session.aggregate";
import { AnalysisResult } from "../domain/entities/analysis-result.entity";
import { DetectionModelConfig } from "../domain/value-objects/detection-model-config.vo";
import { TimeRange } from "../domain/value-objects/time-range.vo";
import { CreateSessionDTO, LogAnalysisSessionDTO } from "../dtos/session.dto";
import { SessionMapper } from "../mappers/session.mapper";
import { IAnalysisResultRepository } from "../ports/analysis-result.repository.port";
import { IAnomalyDetector } from "../ports/anomaly-detector.port";
import { IEventBus } from "../ports/event-bus.port";
import { ILogCollector } from "../ports/log-collector.port";
import { ILogSourceRepository } from "../ports/log-source.repository.port";
import { ISessionRepository } from "../ports/session.repository.port";

@injectable()
export class RunAnomalyDetectionUseCase {
  constructor(
    @inject("ILogSourceRepository")
    private readonly logSourceRepository: ILogSourceRepository,
    @inject("ILogCollector")
    private readonly logCollector: ILogCollector,
    @inject("IAnomalyDetector")
    private readonly anomalyDetector: IAnomalyDetector,
    @inject("ISessionRepository")
    private readonly sessionRepository: ISessionRepository,
    @inject("IAnalysisResultRepository")
    private readonly analysisResultRepository: IAnalysisResultRepository,
    @inject("IEventBus")
    private readonly eventBus: IEventBus,
    private readonly mapper: SessionMapper
  ) {}

  async execute(input: CreateSessionDTO): Promise<LogAnalysisSessionDTO> {
    // Find log source
    const source = await this.logSourceRepository.findById(input.sourceId);
    if (!source) {
      throw new Error(`Log source with ID "${input.sourceId}" not found`);
    }

    // Create value objects
    const timeRange = TimeRange.create(
      new Date(input.timeRange.start),
      new Date(input.timeRange.end)
    );

    const modelConfig = new DetectionModelConfig({
      modelType: input.modelConfig.modelType,
      threshold: input.modelConfig.threshold,
      sensitivity: input.modelConfig.sensitivity,
      parameters: input.modelConfig.parameters,
      llmModel: input.modelConfig.llmModel,
      llmPrompt: input.modelConfig.llmPrompt,
    });

    // Create session aggregate
    const session = LogAnalysisSession.create(source, timeRange, modelConfig);
    await this.sessionRepository.save(session);

    try {
      // Step 1: Collect logs
      session.startCollecting();
      await this.sessionRepository.update(session);

      const logs = await this.logCollector.collect(source.id, timeRange);
      session.addLogEntries(logs);
      await this.sessionRepository.update(session);

      // Publish log collected events
      const events = session.getDomainEvents();
      if (events.length > 0) {
        await this.eventBus.publishBatch(events);
        session.clearDomainEvents();
      }

      // Step 2: Run anomaly detection
      session.startAnalysis();
      await this.sessionRepository.update(session);

      const anomalies = await this.anomalyDetector.analyze(logs, modelConfig);

      // Step 3: Create analysis result
      const analysisResult = AnalysisResult.create(
        session.id,
        source.id,
        this.anomalyDetector.getModelType(),
        logs.length,
        anomalies,
        this.generateSummary(anomalies.length, logs.length),
        timeRange.start,
        timeRange.end
      );

      await this.analysisResultRepository.save(analysisResult);

      // Step 4: Complete session
      session.completeAnalysis(analysisResult);
      await this.sessionRepository.update(session);

      // Publish domain events
      const completionEvents = session.getDomainEvents();
      if (completionEvents.length > 0) {
        await this.eventBus.publishBatch(completionEvents);
        session.clearDomainEvents();
      }

      return this.mapper.toDTO(session);
    } catch (error) {
      // Handle failure
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      session.fail(errorMessage);
      await this.sessionRepository.update(session);

      throw new Error(`Anomaly detection failed: ${errorMessage}`);
    }
  }

  private generateSummary(anomalyCount: number, logCount: number): string {
    if (anomalyCount === 0) {
      return `Analyzed ${logCount} logs. No anomalies detected.`;
    }
    const percentage = ((anomalyCount / logCount) * 100).toFixed(2);
    return `Analyzed ${logCount} logs. Detected ${anomalyCount} anomalies (${percentage}% of logs).`;
  }
}
