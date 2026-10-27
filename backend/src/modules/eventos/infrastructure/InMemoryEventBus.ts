import type {
	EventBus,
	EventHandler,
} from "@/core/shared/domain/events/EventBus";
import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

/**
 * Bus de eventos en memoria. `publish` espera a todos los subscribers y aísla
 * sus fallos: un subscriber que lanza se loguea, pero no rompe el caso de uso.
 */
export class InMemoryEventBus implements EventBus {
	private handlers = new Map<string, EventHandler[]>();

	async publish(event: DomainEvent): Promise<void> {
		const handlers = this.handlers.get(event.eventName) ?? [];
		const resultados = await Promise.allSettled(
			handlers.map(async (handler) => handler(event)),
		);

		for (const resultado of resultados) {
			if (resultado.status === "rejected") {
				console.error(
					`[EventBus] Falló un subscriber de "${event.eventName}":`,
					resultado.reason,
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
