import { describe, expect, it, mock, beforeEach } from "bun:test";
import { EliminarUsuarioUseCase } from "./EliminarUsuarioUseCase";
import { Usuario } from "../../domain/Usuario";
import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";

const mockUsuarioRepository = {
	buscarPorId: mock(),
	eliminar: mock(),
};

describe("EliminarUsuarioUseCase", () => {
	let useCase: EliminarUsuarioUseCase;

	beforeEach(() => {
		mockUsuarioRepository.buscarPorId.mockClear();
		mockUsuarioRepository.eliminar.mockClear();
		useCase = new EliminarUsuarioUseCase(mockUsuarioRepository as never);
	});

	it("debería borrar el usuario si existe", async () => {
		const usuario = Usuario.reconstituir(
			"John",
			"john@test.com",
			"hash",
			true,
			1,
			"USUARIO",
		);
		mockUsuarioRepository.buscarPorId.mockResolvedValue(usuario);
		mockUsuarioRepository.eliminar.mockResolvedValue(undefined);

		await useCase.ejecutar(1);

		expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith(1);
		expect(mockUsuarioRepository.eliminar).toHaveBeenCalledWith(1);
	});

	it("debería lanzar UsuarioNoEncontradoError si el usuario a borrar no existe", async () => {
		mockUsuarioRepository.buscarPorId.mockResolvedValue(null);

		expect(useCase.ejecutar(999)).rejects.toThrow(UsuarioNoEncontradoError);
		expect(mockUsuarioRepository.eliminar).not.toHaveBeenCalled();
	});
});
