import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

interface UsuarioCreadoEventData {
	id: number;
	email: string;
}

export class UsuarioCreadoEvent implements DomainEvent {
	eventName = "usuario.creado";
	occurredOn: Date;
	data: UsuarioCreadoEventData;

	constructor({ email, id }: UsuarioCreadoEventData) {
		this.occurredOn = new Date();
		this.data = { id, email };
	}
}
