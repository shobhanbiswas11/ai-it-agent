import { DomainEvent } from "./domain.event";

export class AnomalyDetectedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly analysisResultId: string,
    public readonly anomalyCount: number,
    public readonly hasCritical: boolean
  ) {
    super("AnomalyDetected");
  }

  toJSON(): Record<string, any> {
    return {
      eventType: this.eventType,
      occurredAt: this.occurredAt,
      sessionId: this.sessionId,
      analysisResultId: this.analysisResultId,
      anomalyCount: this.anomalyCount,
      hasCritical: this.hasCritical,
    };
  }
}
