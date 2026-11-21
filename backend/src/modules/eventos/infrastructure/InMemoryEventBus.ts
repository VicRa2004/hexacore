import { SpanKind } from "@opentelemetry/api";
import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";
import type {
	EventBus,
	EventHandler,
} from "@/core/shared/domain/events/EventBus";
import { contexto } from "@/core/shared/infrastructure/contexto";
import { log } from "@/core/shared/infrastructure/logger";
import { conSpan } from "@/core/shared/infrastructure/telemetria";

/**
 * Bus de eventos en memoria. `publish` espera a todos los subscribers y aísla
 * sus fallos: un subscriber que lanza se loguea, pero no rompe el caso de uso.
 */
export class InMemoryEventBus implements EventBus {
	private handlers = new Map<string, EventHandler[]>();

	async publish(event: DomainEvent): Promise<void> {
		event.meta ??= contexto.actual();
		const handlers = [
			...(this.handlers.get(event.eventName) ?? []),
			...(this.handlers.get("*") ?? []),
		];
		await conSpan(
			`event.publish ${event.eventName}`,
			async () => {
				const resultados = await Promise.allSettled(
					handlers.map(async (handler) => handler(event)),
				);

				for (const resultado of resultados) {
					if (resultado.status === "rejected") {
						log.error(
							`[EventBus] Falló un subscriber de "${event.eventName}"`,
							{
								error: String(resultado.reason),
							},
						);
					}
				}
			},
			{
				kind: SpanKind.INTERNAL,
				attributes: {
					"messaging.system": "in-memory",
					"messaging.destination.name": event.eventName,
				},
			},
		);
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
