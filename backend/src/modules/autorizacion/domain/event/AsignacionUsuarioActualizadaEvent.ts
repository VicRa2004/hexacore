import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

export class AsignacionUsuarioActualizadaEvent implements DomainEvent {
	eventName = "autorizacion.asignacion_actualizada";
	occurredOn = new Date();

	constructor(
		public readonly data: {
			usuarioId: number;
			rolesAgregados: string[];
			rolesQuitados: string[];
			permisosDirectosCambiados: boolean;
		},
	) {}
}
