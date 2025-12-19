import { DomainEvent } from "./domain.event";

export class LogCollectedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly sourceId: string,
    public readonly logCount: number
  ) {
    super("LogCollected");
  }

  toJSON(): Record<string, any> {
    return {
      eventType: this.eventType,
      occurredAt: this.occurredAt,
      sessionId: this.sessionId,
      sourceId: this.sourceId,
      logCount: this.logCount,
    };
  }
}
