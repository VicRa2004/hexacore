import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

interface AjustesActualizadosEventData {
	claves: string[];
}

export class AjustesActualizadosEvent implements DomainEvent {
	eventName = "ajustes.actualizados";
	occurredOn = new Date();

	constructor(public readonly data: AjustesActualizadosEventData) {}
}
