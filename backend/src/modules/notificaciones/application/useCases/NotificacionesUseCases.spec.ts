import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NotificacionNoEncontradaError } from "../../domain/error/NotificacionNoEncontradaError";
import { ListarNotificacionesUseCase } from "./ListarNotificacionesUseCase";
import { MarcarNotificacionLeidaUseCase } from "./MarcarNotificacionLeidaUseCase";
import { MarcarTodasLeidasUseCase } from "./MarcarTodasLeidasUseCase";
import {
	DIAS_RETENCION_NOTIFICACIONES,
	PurgarNotificacionesAntiguasUseCase,
} from "./PurgarNotificacionesAntiguasUseCase";

describe("Casos de uso de notificaciones", () => {
	const repo = {
		crear: mock(),
		listarPorUsuario: mock(),
		marcarLeida: mock(),
		marcarTodasLeidas: mock(),
		eliminarAnterioresA: mock(),
	};

	beforeEach(() => {
		repo.listarPorUsuario.mockReset();
		repo.marcarLeida.mockReset();
		repo.marcarTodasLeidas.mockReset();
		repo.eliminarAnterioresA.mockReset();
	});

	it("ListarNotificacionesUseCase mapea los registros a DTO con contador noLeidas", async () => {
		const createdAt = new Date("2026-11-20T10:00:00.000Z");
		repo.listarPorUsuario.mockResolvedValueOnce({
			datos: [
				{
					id: 1,
					usuarioId: 7,
					tipo: "auth.password_cambiada",
					datos: { metodo: "cambio" },
					leidaEn: null,
					createdAt,
				},
			],
			pagina: 1,
			totalElementos: 1,
			totalPaginas: 1,
			noLeidas: 1,
		});

		const resultado = await new ListarNotificacionesUseCase(repo).ejecutar({
			usuarioId: 7,
			pagina: 1,
			limite: 20,
		});

		expect(resultado).toEqual({
			datos: [
				{
					id: 1,
					tipo: "auth.password_cambiada",
					datos: { metodo: "cambio" },
					leida: false,
					leidaEn: null,
					createdAt: createdAt.toISOString(),
				},
			],
			pagina: 1,
			totalElementos: 1,
			totalPaginas: 1,
			noLeidas: 1,
		});
	});

	it("MarcarNotificacionLeidaUseCase lanza 404 si no existe o pertenece a otro usuario", async () => {
		repo.marcarLeida.mockResolvedValueOnce(null);

		await expect(
			new MarcarNotificacionLeidaUseCase(repo).ejecutar(99, 7),
		).rejects.toBeInstanceOf(NotificacionNoEncontradaError);
	});

	it("MarcarNotificacionLeidaUseCase devuelve el DTO cuando existe", async () => {
		const fecha = new Date("2026-11-20T12:00:00.000Z");
		repo.marcarLeida.mockResolvedValueOnce({
			id: 1,
			usuarioId: 7,
			tipo: "auth.2fa_activado",
			datos: {},
			leidaEn: fecha,
			createdAt: fecha,
		});

		const dto = await new MarcarNotificacionLeidaUseCase(repo).ejecutar(1, 7);
		expect(dto.leida).toBe(true);
		expect(dto.leidaEn).toBe(fecha.toISOString());
	});

	it("MarcarTodasLeidasUseCase retorna la cantidad actualizada", async () => {
		repo.marcarTodasLeidas.mockResolvedValueOnce(4);

		const res = await new MarcarTodasLeidasUseCase(repo).ejecutar(7);
		expect(res).toEqual({ actualizadas: 4 });
	});

	it("PurgarNotificacionesAntiguasUseCase calcula la fecha de corte y purga", async () => {
		repo.eliminarAnterioresA.mockResolvedValueOnce(12);
		const antes = Date.now();

		const eliminadas = await new PurgarNotificacionesAntiguasUseCase(
			repo,
		).ejecutar();

		expect(eliminadas).toBe(12);
		const fechaCorte = repo.eliminarAnterioresA.mock.calls[0]?.[0] as Date;
		const esperadoMs =
			antes - DIAS_RETENCION_NOTIFICACIONES * 24 * 60 * 60 * 1000;
		expect(Math.abs(fechaCorte.getTime() - esperadoMs)).toBeLessThan(2000);
	});
});
