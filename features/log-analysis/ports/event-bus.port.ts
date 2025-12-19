import { DomainEvent } from "../domain/events/domain.event";

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void;
}
