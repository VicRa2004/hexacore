import { describe, it, expect, mock, beforeEach, type Mock } from "bun:test";
import { ObtenerPermisosUseCase } from "./ObtenerPermisosUseCase";
import type { AutorizacionRepository } from "../../domain/repository/AutorizacionRepository";

import { Permiso } from "../../domain/Permiso";

describe("ObtenerPermisosUseCase", () => {
	let buscarTodos: Mock<AutorizacionRepository["buscarTodos"]>;
	let useCase: ObtenerPermisosUseCase;

	beforeEach(() => {
		buscarTodos = mock(() => Promise.resolve([]));
		useCase = new ObtenerPermisosUseCase({ buscarTodos } as never);
	});

	it("debe retornar una lista de permisos mapeados a DTO", async () => {
		const mockPermisos = [
			Permiso.reconstituir(1, "usuarios", "leer"),
			Permiso.reconstituir(2, "usuarios", "write"),
		];

		buscarTodos.mockResolvedValue(mockPermisos);

		const resultado = await useCase.ejecutar();

		expect(buscarTodos).toHaveBeenCalled();
		expect(resultado).toHaveLength(2);
		expect(resultado[0]).toEqual({
			id: 1,
			recurso: "usuarios",
			accion: "leer",
		});
	});
});
