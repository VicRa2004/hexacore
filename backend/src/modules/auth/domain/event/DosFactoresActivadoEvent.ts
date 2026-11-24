import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

export class DosFactoresActivadoEvent implements DomainEvent {
	eventName = "auth.2fa_activado";
	occurredOn = new Date();

	constructor(public readonly data: { usuarioId: number }) {}
}
