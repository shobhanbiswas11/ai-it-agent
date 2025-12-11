import { DomainEvent } from "../domain/events/domain.event";

export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>;
}

export const EventBusPortKey = Symbol("EventBusPort");
