import { describe, expect, it, mock, beforeEach } from "bun:test";
import { ActualizarUsuarioUseCase } from "./ActualizarUsuarioUseCase";
import { Usuario } from "../../domain/Usuario";
import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";

const mockUsuarioRepository = {
	buscarPorId: mock(),
	actualizar: mock(),
};

const mockPasswordHasher = {
	hash: mock(),
	comparar: mock(),
};

describe("ActualizarUsuarioUseCase", () => {
	let useCase: ActualizarUsuarioUseCase;

	beforeEach(() => {
		mockUsuarioRepository.buscarPorId.mockClear();
		mockUsuarioRepository.actualizar.mockClear();
		mockPasswordHasher.hash.mockClear();
		useCase = new ActualizarUsuarioUseCase(
			mockUsuarioRepository as never,
			mockPasswordHasher as never,
			{ publishAll: mock(async () => {}) } as never,
			{ ejecutar: (trabajo: () => Promise<unknown>) => trabajo() } as never,
		);
	});

	it("debería actualizar el usuario si existe", async () => {
		const usuario = Usuario.reconstituir(
			"John",
			"john@test.com",
			"hash",
			true,
			1,
			"USUARIO",
		);
		mockUsuarioRepository.buscarPorId.mockResolvedValue(usuario);
		mockUsuarioRepository.actualizar.mockImplementation(
			async (u: Usuario) => u,
		);

		const resultado = await useCase.ejecutar(1, { nombre: "John Updated" });

		expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith(1);
		expect(resultado.id).toBe(1);
		expect(resultado.nombre).toBe("John Updated");
		expect(resultado.email).toBe("john@test.com");
		expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
	});

	it("debería hashear la contraseña antes de guardarla", async () => {
		const usuario = Usuario.reconstituir(
			"John",
			"john@test.com",
			"old_hash",
			true,
			1,
			"USUARIO",
		);
		mockUsuarioRepository.buscarPorId.mockResolvedValue(usuario);
		mockUsuarioRepository.actualizar.mockImplementation(
			async (u: Usuario) => u,
		);
		mockPasswordHasher.hash.mockResolvedValue("new_hash");

		await useCase.ejecutar(1, { password: "NewPassword123!" });

		const guardado = mockUsuarioRepository.actualizar.mock
			.calls[0]?.[0] as Usuario;
		expect(mockPasswordHasher.hash).toHaveBeenCalledWith("NewPassword123!");
		expect(guardado.getPasswordHash()).toBe("new_hash");
	});

	it("debería lanzar UsuarioNoEncontradoError si el usuario a actualizar no existe", async () => {
		mockUsuarioRepository.buscarPorId.mockResolvedValue(null);

		expect(useCase.ejecutar(999, { nombre: "New Name" })).rejects.toThrow(
			UsuarioNoEncontradoError,
		);
		expect(mockUsuarioRepository.actualizar).not.toHaveBeenCalled();
	});
});
