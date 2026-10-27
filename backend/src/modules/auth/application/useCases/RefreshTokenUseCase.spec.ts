import { describe, expect, it, mock, beforeEach } from "bun:test";
import { RefreshTokenUseCase } from "./RefreshTokenUseCase";
import { EmisorSesion } from "../services/EmisorSesion";
import { Usuario } from "@/core/usuario";

const mockTokenService = {
	generarToken: mock(() => "access"),
	generarRefreshToken: mock(() => "new_refresh"),
	hashearRefreshToken: mock(() => "hash"),
};

const mockRefreshTokenRepo = {
	crear: mock(),
	buscarValidoPorHash: mock(),
	buscarPorHash: mock(),
	revocarPorId: mock(),
	revocarTodosPorUsuarioId: mock(),
};

const mockUsuarioRepository = {
	buscarPorId: mock(),
};

describe("RefreshTokenUseCase", () => {
	let useCase: RefreshTokenUseCase;

	beforeEach(() => {
		for (const fn of Object.values(mockRefreshTokenRepo)) fn.mockReset();
		mockUsuarioRepository.buscarPorId.mockReset();
		mockRefreshTokenRepo.buscarValidoPorHash.mockResolvedValue({
			id: 1,
			usuarioId: 5,
			expiraEn: new Date(Date.now() + 60_000),
		});
		useCase = new RefreshTokenUseCase(
			mockTokenService as never,
			mockRefreshTokenRepo as never,
			mockUsuarioRepository as never,
			new EmisorSesion(
				mockTokenService as never,
				mockRefreshTokenRepo as never,
			),
		);
	});

	it("debería rotar el token y emitir un nuevo par", async () => {
		mockRefreshTokenRepo.revocarPorId.mockResolvedValue(true);
		mockUsuarioRepository.buscarPorId.mockResolvedValue(
			Usuario.reconstituir("Ana", "a@x.com", "hash", true, 5, ["USUARIO"]),
		);

		const resultado = await useCase.ejecutar("refresh");

		expect(resultado.refreshToken).toBe("new_refresh");
		expect(mockRefreshTokenRepo.crear).toHaveBeenCalledTimes(1);
	});

	it("no debería emitir una segunda sesión si otra petición ya rotó el token", async () => {
		mockRefreshTokenRepo.revocarPorId.mockResolvedValue(false);

		expect(useCase.ejecutar("refresh")).rejects.toThrow(
			"Refresh token inválido o expirado",
		);
		expect(mockRefreshTokenRepo.crear).not.toHaveBeenCalled();
	});

	it("debería rechazar a un usuario desactivado", async () => {
		mockRefreshTokenRepo.revocarPorId.mockResolvedValue(true);
		mockUsuarioRepository.buscarPorId.mockResolvedValue(
			Usuario.reconstituir("Ana", "a@x.com", "hash", false, 5, ["USUARIO"]),
		);

		expect(useCase.ejecutar("refresh")).rejects.toThrow("inactivo");
		expect(mockRefreshTokenRepo.crear).not.toHaveBeenCalled();
	});
});
