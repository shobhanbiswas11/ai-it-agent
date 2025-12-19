export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly eventType: string;

  constructor(eventType: string) {
    this.eventType = eventType;
    this.occurredAt = new Date();
  }

  abstract toJSON(): Record<string, any>;
}
