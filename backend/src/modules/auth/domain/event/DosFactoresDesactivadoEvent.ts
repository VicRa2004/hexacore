import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

export class DosFactoresDesactivadoEvent implements DomainEvent {
	eventName = "auth.2fa_desactivado";
	occurredOn = new Date();

	constructor(public readonly data: { usuarioId: number }) {}
}
