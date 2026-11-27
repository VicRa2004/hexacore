import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

export type MetodoCambioPassword = "cambio" | "restablecimiento";

export class PasswordCambiadaEvent implements DomainEvent {
	eventName = "auth.password_cambiada";
	occurredOn = new Date();

	constructor(
		public readonly data: {
			usuarioId: number;
			metodo: MetodoCambioPassword;
		},
	) {}
}
