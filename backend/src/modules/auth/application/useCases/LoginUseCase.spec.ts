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

const mockCuentaRepo = {
	bloqueadoHasta: mock(async (): Promise<Date | null> => null),
	registrarFallo: mock(async () => {}),
	reiniciarFallos: mock(async () => {}),
};

const construirUsuario = (isActivo: boolean) =>
	Usuario.reconstituir("Ana", "a@x.com", "hash", isActivo, 5, ["USUARIO"]);

describe("LoginUseCase", () => {
	let useCase: LoginUseCase;

	beforeEach(() => {
		mockUsuarioRepository.buscarPorEmail.mockReset();
		mockPasswordHasher.comparar.mockReset();
		mockRefreshTokenRepo.crear.mockClear();
		mockCuentaRepo.bloqueadoHasta.mockClear();
		mockCuentaRepo.registrarFallo.mockClear();
		mockCuentaRepo.reiniciarFallos.mockClear();
		useCase = new LoginUseCase(
			mockUsuarioRepository as never,
			mockPasswordHasher as never,
			new EmisorSesion(
				mockTokenService as never,
				mockRefreshTokenRepo as never,
			),
			mockCuentaRepo as never,
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

	it("debería registrar el fallo si la contraseña es incorrecta", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(
			construirUsuario(true),
		);
		mockPasswordHasher.comparar.mockResolvedValue(false);

		await expect(
			useCase.ejecutar({ email: "a@x.com", password: "mala" }),
		).rejects.toThrow("Credenciales inválidas");
		expect(mockCuentaRepo.registrarFallo).toHaveBeenCalledWith(5, {
			maxIntentos: 5,
			bloqueoMs: 15 * 60 * 1000,
		});
		expect(mockCuentaRepo.reiniciarFallos).not.toHaveBeenCalled();
	});

	it("debería rechazar una cuenta bloqueada aunque la contraseña sea correcta", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(
			construirUsuario(true),
		);
		mockCuentaRepo.bloqueadoHasta.mockResolvedValueOnce(
			new Date(Date.now() + 60_000),
		);
		mockPasswordHasher.comparar.mockResolvedValue(true);

		await expect(
			useCase.ejecutar({ email: "a@x.com", password: "pass" }),
		).rejects.toThrow("Cuenta bloqueada temporalmente");
		expect(mockPasswordHasher.comparar).not.toHaveBeenCalled();
		expect(mockRefreshTokenRepo.crear).not.toHaveBeenCalled();
	});

	it("debería reiniciar los fallos tras un login correcto", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(
			construirUsuario(true),
		);
		mockPasswordHasher.comparar.mockResolvedValue(true);

		await useCase.ejecutar({ email: "a@x.com", password: "pass" });

		expect(mockCuentaRepo.reiniciarFallos).toHaveBeenCalledWith(5);
	});
});
