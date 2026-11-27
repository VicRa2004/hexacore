import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";
import type { EventHandler } from "@/core/shared/domain/events/EventBus";
import { RegistrarNotificaciones } from "./RegistrarNotificaciones";

describe("RegistrarNotificaciones", () => {
	const handlers = new Map<string, EventHandler[]>();
	const eventBus = {
		publish: mock(async () => {}),
		publishAll: mock(async () => {}),
		subscribe: mock((eventName: string, handler: EventHandler) => {
			handlers.set(eventName, [...(handlers.get(eventName) ?? []), handler]);
		}),
	};

	const repo = {
		crear: mock(async () => {}),
		listarPorUsuario: mock(),
		marcarLeida: mock(),
		marcarTodasLeidas: mock(),
		eliminarAnterioresA: mock(),
	};

	async function emitir(event: DomainEvent): Promise<void> {
		for (const handler of handlers.get(event.eventName) ?? []) {
			await handler(event);
		}
	}

	beforeEach(() => {
		handlers.clear();
		eventBus.subscribe.mockClear();
		repo.crear.mockReset();
		new RegistrarNotificaciones(eventBus, repo as never).suscribir();
	});

	it("notifica usuario.actualizado solo si lo edita otro usuario", async () => {
		await emitir({
			eventName: "usuario.actualizado",
			occurredOn: new Date(),
			data: { id: 5, campos: ["nombre"] },
			meta: { usuarioId: 5 },
		});
		expect(repo.crear).not.toHaveBeenCalled();

		await emitir({
			eventName: "usuario.actualizado",
			occurredOn: new Date(),
			data: { id: 5, campos: ["nombre", "isActivo"] },
			meta: { usuarioId: 1 },
		});
		expect(repo.crear).toHaveBeenCalledWith({
			usuarioId: 5,
			tipo: "usuario.actualizado",
			datos: { campos: ["nombre", "isActivo"] },
		});
	});

	it("notifica autorizacion.asignacion_actualizada cuando hay cambios", async () => {
		await emitir({
			eventName: "autorizacion.asignacion_actualizada",
			occurredOn: new Date(),
			data: {
				usuarioId: 8,
				rolesAgregados: [],
				rolesQuitados: [],
				permisosDirectosCambiados: false,
			},
		});
		expect(repo.crear).not.toHaveBeenCalled();

		await emitir({
			eventName: "autorizacion.asignacion_actualizada",
			occurredOn: new Date(),
			data: {
				usuarioId: 8,
				rolesAgregados: ["ADMIN"],
				rolesQuitados: [],
				permisosDirectosCambiados: false,
			},
		});
		expect(repo.crear).toHaveBeenCalledWith({
			usuarioId: 8,
			tipo: "autorizacion.asignacion_actualizada",
			datos: {
				rolesAgregados: ["ADMIN"],
				rolesQuitados: [],
				permisosDirectosCambiados: false,
			},
		});
	});

	it("notifica auth.password_cambiada y auth.sesion_iniciada con userAgent", async () => {
		await emitir({
			eventName: "auth.password_cambiada",
			occurredOn: new Date(),
			data: { usuarioId: 3, metodo: "cambio" },
		});
		await emitir({
			eventName: "auth.sesion_iniciada",
			occurredOn: new Date(),
			data: { usuarioId: 3, metodo: "2fa" },
			meta: { userAgent: "Mozilla/5.0" },
		});

		expect(repo.crear).toHaveBeenNthCalledWith(1, {
			usuarioId: 3,
			tipo: "auth.password_cambiada",
			datos: { metodo: "cambio" },
		});
		expect(repo.crear).toHaveBeenNthCalledWith(2, {
			usuarioId: 3,
			tipo: "auth.sesion_iniciada",
			datos: { metodo: "2fa", dispositivo: "Mozilla/5.0" },
		});
	});

	it("notifica eventos 2FA e ignora payloads inválidos defensivamente", async () => {
		await emitir({
			eventName: "auth.2fa_activado",
			occurredOn: new Date(),
			data: { usuarioId: 4 },
		});
		await emitir({
			eventName: "auth.2fa_desactivado",
			occurredOn: new Date(),
			data: { usuarioId: 4 },
		});
		await emitir({
			eventName: "auth.sesion_iniciada",
			occurredOn: new Date(),
			data: { usuarioId: -1 },
		});
		await emitir({
			eventName: "usuario.actualizado",
			occurredOn: new Date(),
			data: null,
		});

		expect(repo.crear).toHaveBeenCalledTimes(2);
		expect(repo.crear).toHaveBeenNthCalledWith(1, {
			usuarioId: 4,
			tipo: "auth.2fa_activado",
			datos: {},
		});
		expect(repo.crear).toHaveBeenNthCalledWith(2, {
			usuarioId: 4,
			tipo: "auth.2fa_desactivado",
			datos: {},
		});
	});
});
