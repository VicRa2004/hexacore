import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

interface UsuarioEliminadoEventData {
	id: number;
	email: string;
}

export class UsuarioEliminadoEvent implements DomainEvent {
	eventName = "usuario.eliminado";
	occurredOn = new Date();

	constructor(public readonly data: UsuarioEliminadoEventData) {}
}
