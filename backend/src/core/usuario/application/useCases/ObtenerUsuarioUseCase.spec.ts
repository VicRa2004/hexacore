import { describe, expect, it, mock, beforeEach } from "bun:test";
import { ObtenerUsuarioUseCase } from "./ObtenerUsuarioUseCase";
import { Usuario } from "../../domain/Usuario";
import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";

const mockUsuarioRepository = {
	buscarPorId: mock(),
};

describe("ObtenerUsuarioUseCase", () => {
	let useCase: ObtenerUsuarioUseCase;

	beforeEach(() => {
		mockUsuarioRepository.buscarPorId.mockClear();
		useCase = new ObtenerUsuarioUseCase(mockUsuarioRepository as never);
	});

	it("debería devolver un UsuarioDto si el usuario existe", async () => {
		const usuario = Usuario.reconstituir(
			"John",
			"john@test.com",
			"hash",
			true,
			1,
			"USUARIO",
		);
		mockUsuarioRepository.buscarPorId.mockResolvedValue(usuario);

		const resultado = await useCase.ejecutar(1);

		expect(resultado.id).toBe(1);
		expect(resultado.email).toBe("john@test.com");
		expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith(1);
	});

	it("debería lanzar UsuarioNoEncontradoError si el usuario no existe", async () => {
		mockUsuarioRepository.buscarPorId.mockResolvedValue(null);

		expect(useCase.ejecutar(999)).rejects.toThrow(UsuarioNoEncontradoError);
	});
});
