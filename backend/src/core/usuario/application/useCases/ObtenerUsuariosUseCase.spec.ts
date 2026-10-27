import { describe, expect, it, mock, beforeEach } from "bun:test";
import { ObtenerUsuariosUseCase } from "./ObtenerUsuariosUseCase";
import { Usuario } from "../../domain/Usuario";

const mockUsuarioRepository = {
	buscar: mock(),
};

describe("ObtenerUsuariosUseCase", () => {
	let useCase: ObtenerUsuariosUseCase;

	beforeEach(() => {
		mockUsuarioRepository.buscar.mockClear();
		useCase = new ObtenerUsuariosUseCase(mockUsuarioRepository as never);
	});

	it("debería devolver una lista paginada de usuarios", async () => {
		const usuario = Usuario.reconstituir(
			"John",
			"john@test.com",
			"hash",
			true,
			1,
			"USUARIO",
		);
		mockUsuarioRepository.buscar.mockResolvedValue({
			datos: [usuario],
			pagina: 1,
			totalElementos: 1,
			totalPaginas: 1,
		});

		const resultado = await useCase.ejecutar({ pagina: 1, limite: 10 });

		expect(resultado.datos).toHaveLength(1);
		expect(resultado.datos[0].email).toBe("john@test.com");
		expect(resultado.totalElementos).toBe(1);
		expect(mockUsuarioRepository.buscar).toHaveBeenCalled();
	});

	it("debería devolver lista vacía si no hay usuarios", async () => {
		mockUsuarioRepository.buscar.mockResolvedValue({
			datos: [],
			pagina: 1,
			totalElementos: 0,
			totalPaginas: 0,
		});

		const resultado = await useCase.ejecutar({ pagina: 1, limite: 10 });

		expect(resultado.datos).toHaveLength(0);
	});
});
