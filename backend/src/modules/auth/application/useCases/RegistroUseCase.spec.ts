import { describe, expect, it, mock, beforeEach, spyOn } from "bun:test";
import { RegistroUseCase } from "./RegistroUseCase";
import { EmisorSesion } from "../services/EmisorSesion";
import { Usuario } from "@/core/usuario";

const mockUsuarioRepository = {
	buscarPorEmail: mock(),
	crear: mock(),
};

const mockPasswordHasher = {
	hash: mock(async () => "hashed"),
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

const mockCorreos = { enviar: mock(async () => {}) };

describe("RegistroUseCase", () => {
	let useCase: RegistroUseCase;

	beforeEach(() => {
		mockUsuarioRepository.buscarPorEmail.mockReset();
		mockUsuarioRepository.crear.mockReset();
		mockRefreshTokenRepo.crear.mockClear();
		mockCorreos.enviar.mockReset();
		mockCorreos.enviar.mockImplementation(async () => {});
		useCase = new RegistroUseCase(
			mockUsuarioRepository as never,
			mockPasswordHasher as never,
			new EmisorSesion(
				mockTokenService as never,
				mockRefreshTokenRepo as never,
			),
			mockCorreos as never,
		);
	});

	it("debería guardar el usuario con la contraseña hasheada y emitir la sesión", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
		mockUsuarioRepository.crear.mockImplementation(async (usuario: Usuario) =>
			Usuario.reconstituir(
				usuario.getNombre(),
				usuario.getEmail(),
				usuario.getPasswordHash(),
				true,
				7,
				["USUARIO"],
			),
		);

		const resultado = await useCase.ejecutar({
			nombre: "Ana",
			email: "ana@x.com",
			password: "secreta123",
		});

		const guardado = mockUsuarioRepository.crear.mock.calls[0]?.[0] as Usuario;
		expect(guardado.getPasswordHash()).toBe("hashed");
		expect(resultado).toMatchObject({
			accessToken: "access",
			refreshToken: "refresh",
			usuario: { id: 7, email: "ana@x.com" },
		});
		expect(mockRefreshTokenRepo.crear).toHaveBeenCalled();
		expect(mockCorreos.enviar).toHaveBeenCalledWith(
			expect.objectContaining({}),
			"verificar_email",
		);
	});

	it("no debería fallar el registro si el correo de verificación falla", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
		mockUsuarioRepository.crear.mockImplementation(async (usuario: Usuario) =>
			Usuario.reconstituir(
				usuario.getNombre(),
				usuario.getEmail(),
				"hashed",
				true,
				8,
				["USUARIO"],
			),
		);
		mockCorreos.enviar.mockRejectedValue(new Error("SMTP caído"));
		const consola = spyOn(console, "error").mockImplementation(() => {});

		const resultado = await useCase.ejecutar({
			nombre: "Bea",
			email: "bea@x.com",
			password: "secreta123",
		});

		expect(resultado.usuario.id).toBe(8);
		consola.mockRestore();
	});

	it("debería rechazar un email ya registrado sin crear sesión", async () => {
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(
			Usuario.reconstituir("Ana", "ana@x.com", "hash", true, 7, ["USUARIO"]),
		);

		await expect(
			useCase.ejecutar({
				nombre: "Ana",
				email: "ana@x.com",
				password: "secreta123",
			}),
		).rejects.toThrow("Ya existe un usuario con ese email");
		expect(mockUsuarioRepository.crear).not.toHaveBeenCalled();
		expect(mockRefreshTokenRepo.crear).not.toHaveBeenCalled();
	});
});
