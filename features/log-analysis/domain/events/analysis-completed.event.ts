import { DomainEvent } from "./domain.event";

export class AnalysisCompletedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly analysisResultId: string,
    public readonly hasAnomalies: boolean
  ) {
    super("AnalysisCompleted");
  }

  toJSON(): Record<string, any> {
    return {
      eventType: this.eventType,
      occurredAt: this.occurredAt,
      sessionId: this.sessionId,
      analysisResultId: this.analysisResultId,
      hasAnomalies: this.hasAnomalies,
    };
  }
}
