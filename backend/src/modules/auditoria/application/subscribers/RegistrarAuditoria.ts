import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { AuditoriaRepository } from "../../domain/repository/AuditoriaRepository";

/** Guarda cada evento de dominio con el actor y la petición que lo originaron. */
export class RegistrarAuditoria {
	constructor(
		private readonly eventBus: EventBus,
		private readonly auditoria: AuditoriaRepository,
	) {}

	public suscribir(): void {
		this.eventBus.subscribe("*", (event) =>
			this.auditoria.guardar({
				evento: event.eventName,
				datos: event.data,
				usuarioId: event.meta?.usuarioId ?? null,
				requestId: event.meta?.requestId ?? null,
				ocurridoEn: event.occurredOn,
			}),
		);
	}
}
