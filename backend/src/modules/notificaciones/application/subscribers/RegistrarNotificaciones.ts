import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";

function esObjeto(valor: unknown): valor is Record<string, unknown> {
	return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function leerEnteroPositivo(valor: unknown): number | null {
	return typeof valor === "number" && Number.isInteger(valor) && valor > 0
		? valor
		: null;
}

function leerListaStrings(valor: unknown): string[] {
	if (!Array.isArray(valor)) return [];
	return valor.filter((item): item is string => typeof item === "string");
}

/**
 * Suscriptor de eventos de dominio que genera notificaciones dentro de la app
 * sin acoplarse a las clases internas de otros módulos.
 */
export class RegistrarNotificaciones {
	constructor(
		private readonly eventBus: EventBus,
		private readonly repo: NotificacionRepository,
	) {}

	public suscribir(): void {
		this.eventBus.subscribe("usuario.actualizado", (event) =>
			this.onUsuarioActualizado(event),
		);
		this.eventBus.subscribe("autorizacion.asignacion_actualizada", (event) =>
			this.onAsignacionActualizada(event),
		);
		this.eventBus.subscribe("auth.password_cambiada", (event) =>
			this.onPasswordCambiada(event),
		);
		this.eventBus.subscribe("auth.sesion_iniciada", (event) =>
			this.onSesionIniciada(event),
		);
		this.eventBus.subscribe("auth.2fa_activado", (event) =>
			this.onUsuarioEventoSimple(event),
		);
		this.eventBus.subscribe("auth.2fa_desactivado", (event) =>
			this.onUsuarioEventoSimple(event),
		);
	}

	private async onUsuarioActualizado(event: DomainEvent): Promise<void> {
		if (!esObjeto(event.data)) return;
		const usuarioId = leerEnteroPositivo(event.data.id);
		if (!usuarioId) return;
		// Si el propio usuario editó su perfil, no necesita notificación.
		if (event.meta?.usuarioId === usuarioId) return;

		const campos = leerListaStrings(event.data.campos);
		await this.repo.crear({
			usuarioId,
			tipo: event.eventName,
			datos: { campos },
		});
	}

	private async onAsignacionActualizada(event: DomainEvent): Promise<void> {
		if (!esObjeto(event.data)) return;
		const usuarioId = leerEnteroPositivo(event.data.usuarioId);
		if (!usuarioId) return;

		const rolesAgregados = leerListaStrings(event.data.rolesAgregados);
		const rolesQuitados = leerListaStrings(event.data.rolesQuitados);
		const permisosDirectosCambiados = Boolean(
			event.data.permisosDirectosCambiados,
		);

		if (
			rolesAgregados.length === 0 &&
			rolesQuitados.length === 0 &&
			!permisosDirectosCambiados
		) {
			return;
		}

		await this.repo.crear({
			usuarioId,
			tipo: event.eventName,
			datos: {
				rolesAgregados,
				rolesQuitados,
				permisosDirectosCambiados,
			},
		});
	}

	private async onPasswordCambiada(event: DomainEvent): Promise<void> {
		if (!esObjeto(event.data)) return;
		const usuarioId = leerEnteroPositivo(event.data.usuarioId);
		if (!usuarioId) return;

		const metodo =
			event.data.metodo === "restablecimiento" ? "restablecimiento" : "cambio";

		await this.repo.crear({
			usuarioId,
			tipo: event.eventName,
			datos: { metodo },
		});
	}

	private async onSesionIniciada(event: DomainEvent): Promise<void> {
		if (!esObjeto(event.data)) return;
		const usuarioId = leerEnteroPositivo(event.data.usuarioId);
		if (!usuarioId) return;

		const metodo =
			event.data.metodo === "2fa" || event.data.metodo === "oauth"
				? event.data.metodo
				: "password";
		const dispositivo =
			typeof event.meta?.userAgent === "string" &&
			event.meta.userAgent.trim().length > 0
				? event.meta.userAgent
				: null;

		await this.repo.crear({
			usuarioId,
			tipo: event.eventName,
			datos: { metodo, dispositivo },
		});
	}

	private async onUsuarioEventoSimple(event: DomainEvent): Promise<void> {
		if (!esObjeto(event.data)) return;
		const usuarioId = leerEnteroPositivo(event.data.usuarioId);
		if (!usuarioId) return;

		await this.repo.crear({
			usuarioId,
			tipo: event.eventName,
			datos: {},
		});
	}
}
