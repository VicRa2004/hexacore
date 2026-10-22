import type { DomainEvent } from "./DomainEvent";

export type EventHandler<E extends DomainEvent = DomainEvent> = (
	event: E,
) => void | Promise<void>;

export interface EventBus {
	/** Resuelve cuando terminan todos los subscribers; sus errores no se propagan. */
	publish(event: DomainEvent): Promise<void>;
	publishAll(events: DomainEvent[]): Promise<void>;
	subscribe<E extends DomainEvent>(
		eventName: string,
		handler: EventHandler<E>,
	): void;
}
