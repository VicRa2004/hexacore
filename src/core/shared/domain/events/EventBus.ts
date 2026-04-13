import type { DomainEvent } from "./DomainEvent";

export interface EventBus {
  publish(event: DomainEvent): void;
  publishAll(events: DomainEvent[]): void;
  subscribe(eventName: string, handler: (event: DomainEvent) => void): void;
}
