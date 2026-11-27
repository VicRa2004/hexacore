import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

export type MetodoInicioSesion = "password" | "2fa" | "oauth";

export class SesionIniciadaEvent implements DomainEvent {
	eventName = "auth.sesion_iniciada";
	occurredOn = new Date();

	constructor(
		public readonly data: {
			usuarioId: number;
			metodo: MetodoInicioSesion;
		},
	) {}
}
