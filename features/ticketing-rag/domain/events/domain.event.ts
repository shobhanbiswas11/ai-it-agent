export abstract class DomainEvent {
  abstract type: string;
  abstract payload?: Record<string, any>;
}
