import { DomainEvent } from "../domain/events/domain.event";
import { EventBusPort } from "../ports/event-bus.port";

export class MemoryEventBusAdapter implements EventBusPort {
  publish(event: DomainEvent): Promise<void> {
    return Promise.resolve();
  }
}
