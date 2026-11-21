import { describe, expect, it, mock } from "bun:test";
import { CerrarSesionUseCase } from "./CerrarSesionUseCase";
import { ListarSesionesUseCase } from "./ListarSesionesUseCase";

const tokenService = { hashearRefreshToken: (t: string) => `hash-${t}` };
const sesion = (id: number, tokenHash: string) => ({
	id,
	tokenHash,
	userAgent: "Firefox",
	ultimoUso: new Date("2026-11-20T10:00:00Z"),
	expiraEn: new Date("2026-11-27T10:00:00Z"),
});

describe("ListarSesionesUseCase", () => {
	it("debería marcar como actual solo la sesión de la cookie y no exponer el hash", async () => {
		const repo = {
			listarActivosPorUsuario: mock(async () => [
				sesion(1, "hash-movil"),
				sesion(2, "hash-portatil"),
			]),
		};
		const useCase = new ListarSesionesUseCase(
			tokenService as never,
			repo as never,
		);

		const sesiones = await useCase.ejecutar(5, "portatil");

		expect(repo.listarActivosPorUsuario).toHaveBeenCalledWith(5);
		expect(sesiones.map((s) => [s.id, s.actual])).toEqual([
			[1, false],
			[2, true],
		]);
		expect(sesiones[0]).not.toHaveProperty("tokenHash");
	});

	it("sin cookie ninguna sesión es la actual", async () => {
		const repo = {
			listarActivosPorUsuario: mock(async () => [sesion(1, "hash-x")]),
		};
		const useCase = new ListarSesionesUseCase(
			tokenService as never,
			repo as never,
		);

		expect((await useCase.ejecutar(5))[0]?.actual).toBe(false);
	});
});

describe("CerrarSesionUseCase", () => {
	it("debería dar 404 si la sesión no es del usuario o ya estaba cerrada", async () => {
		const repo = { revocarDeUsuario: mock(async () => false) };
		const useCase = new CerrarSesionUseCase(repo as never);

		await expect(useCase.ejecutar(5, 9)).rejects.toMatchObject({
			code: 404,
		});
		expect(repo.revocarDeUsuario).toHaveBeenCalledWith(9, 5);
	});
});
