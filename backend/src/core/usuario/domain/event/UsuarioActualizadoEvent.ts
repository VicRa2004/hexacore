import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

interface UsuarioActualizadoEventData {
	id: number;
	/** Nombres de los campos cambiados; nunca sus valores (p. ej. el hash). */
	campos: string[];
}

export class UsuarioActualizadoEvent implements DomainEvent {
	eventName = "usuario.actualizado";
	occurredOn = new Date();

	constructor(public readonly data: UsuarioActualizadoEventData) {}
}
