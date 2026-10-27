import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UsuarioCreadoEvent } from "../../domain/event/UsuarioCreadoEvent";

export class EnviarEmailBienvenida {
	constructor(private readonly eventBus: EventBus) {}

	public suscribir(): void {
		this.eventBus.subscribe("usuario.creado", (event: UsuarioCreadoEvent) => {
			this.onUsuarioCreado(event);
		});
	}

	private onUsuarioCreado(event: UsuarioCreadoEvent): void {
		const { email, id } = event.data;
		console.log(
			`[Email Service]: Enviando correo de bienvenida a ${email} (Usuario ID: ${id})`,
		);
	}
}
