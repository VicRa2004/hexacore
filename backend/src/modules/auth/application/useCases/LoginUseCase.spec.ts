import { describe, expect, it, mock, beforeEach } from "bun:test";
import { LoginUseCase } from "./LoginUseCase";
import { EmisorSesion } from "../services/EmisorSesion";
import { Usuario } from "@/core/usuario";

const mockUsuarioRepository = {
	buscarPorEmail: mock(),
};

const mockPasswordHasher = {
	hash: mock(),
	comparar: mock(),
};

const mockTokenService = {
	generarToken: mock(() => "access"),
	generarRefreshToken: mock(() => "refresh"),
	hashearRefreshToken: mock(() => "refresh_hash"),
};

const mockRefreshTokenRepo = {
	crear: mock(),
};

const construirUsuario = (isActivo: boolean) =>
	Usuario.reconstituir("Ana", "a@x.com", "hash", isActivo, 5, ["USUARIO"]);

describe("LoginUseCase", () => {
	let useCase: LoginUseCase;

	beforeEach(() => {
		mockUsuarioRepository.buscarPorEmail.mockReset();
		mockPasswordHasher.comparar.mockReset();
		mockRefreshTokenRepo.crear.mockClear();
		useCase = new LoginUseCase(
			mockUsuarioRepository as never,
			mockPasswordHasher as never,
			new EmisorSesion(
				mockTokenService as never,
				mockRefreshTokenRepo as never,
			),
		);
	});

	it("debería buscar el usuario por email exacto y emitir la sesión", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(
			construirUsuario(true),
		);
		mockPasswordHasher.comparar.mockResolvedValue(true);

		const resultado = await useCase.ejecutar({
			email: "a@x.com",
			password: "pass",
		});

		expect(mockUsuarioRepository.buscarPorEmail).toHaveBeenCalledWith(
			"a@x.com",
		);
		expect(resultado.usuario.id).toBe(5);
		expect(mockRefreshTokenRepo.crear).toHaveBeenCalled();
	});

	it("debería lanzar 401 si el email no existe, comparando igualmente el hash", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
		mockPasswordHasher.comparar.mockResolvedValue(false);

		await expect(
			useCase.ejecutar({ email: "a@x.com", password: "pass" }),
		).rejects.toThrow("Credenciales inválidas");
		// bcrypt corre aunque el email no exista: misma latencia que un fallo de contraseña
		expect(mockPasswordHasher.comparar).toHaveBeenCalledTimes(1);
	});

	it("debería rechazar a un usuario desactivado", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(
			construirUsuario(false),
		);
		mockPasswordHasher.comparar.mockResolvedValue(true);

		expect(
			useCase.ejecutar({ email: "a@x.com", password: "pass" }),
		).rejects.toThrow("El usuario está inactivo");
		expect(mockRefreshTokenRepo.crear).not.toHaveBeenCalled();
	});
});
