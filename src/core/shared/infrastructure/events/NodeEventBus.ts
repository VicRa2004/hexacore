import { EventEmitter } from "events";
import type { EventBus } from "../../domain/events/EventBus";
import type { DomainEvent } from "../../domain/events/DomainEvent";
import { singleton } from "tsyringe";

@singleton()
export class NodeEventBus implements EventBus {
  private emitter = new EventEmitter();

  publish(event: DomainEvent): void {
    this.emitter.emit(event.eventName, event);
  }

  subscribe(eventName: string, handler: (event: DomainEvent) => void): void {
    this.emitter.on(eventName, handler);
  }

  publishAll(events: DomainEvent[]): void {
    events.forEach((event) => this.publish(event));
  }
}
