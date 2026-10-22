import type { DomainEvent } from "./DomainEvent";

export type EventHandler = (event: DomainEvent) => void | Promise<void>;

export interface EventBus {
	/** Resuelve cuando terminan todos los subscribers; sus errores no se propagan. */
	publish(event: DomainEvent): Promise<void>;
	publishAll(events: DomainEvent[]): Promise<void>;
	subscribe(eventName: string, handler: EventHandler): void;
}
