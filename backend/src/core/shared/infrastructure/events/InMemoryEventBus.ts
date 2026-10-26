import type { EventBus, EventHandler } from "../../domain/events/EventBus";
import type { DomainEvent } from "../../domain/events/DomainEvent";

/**
 * Bus de eventos en memoria. `publish` espera a todos los subscribers y aísla
 * sus fallos: un subscriber que lanza se loguea, pero no rompe el caso de uso.
 */
export class InMemoryEventBus implements EventBus {
	private handlers = new Map<string, EventHandler[]>();

	async publish(event: DomainEvent): Promise<void> {
		const handlers = this.handlers.get(event.eventName) ?? [];
		const results = await Promise.allSettled(
			handlers.map(async (handler) => handler(event)),
		);

		for (const result of results) {
			if (result.status === "rejected") {
				console.error(
					`[EventBus] Falló un subscriber de "${event.eventName}":`,
					result.reason,
				);
			}
		}
	}

	subscribe<E extends DomainEvent>(
		eventName: string,
		handler: EventHandler<E>,
	): void {
		// El nombre del evento determina su tipo: quien se suscribe elige E.
		this.handlers.set(eventName, [
			...(this.handlers.get(eventName) ?? []),
			handler as EventHandler,
		]);
	}

	async publishAll(events: DomainEvent[]): Promise<void> {
		await Promise.all(events.map((event) => this.publish(event)));
	}
}
