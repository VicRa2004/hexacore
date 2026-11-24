import { describe, expect, it } from "bun:test";
import { obtenerUsuariosSchema } from "./usuarioSchemas";
import { construirOrdenUsuario } from "../../repository/PrismaUsuarioRepository";

describe("obtenerUsuariosSchema", () => {
	it("acepta campos de orden de la lista blanca y dirección válida", () => {
		expect(
			obtenerUsuariosSchema.parse({
				orden: "nombre",
				direccion: "desc",
			}),
		).toEqual({
			pagina: 1,
			limite: 10,
			orden: "nombre",
			direccion: "desc",
		});
	});

	it("rechaza campos fuera de la lista blanca y direcciones inválidas", () => {
		expect(() => obtenerUsuariosSchema.parse({ orden: "password" })).toThrow();
		expect(() =>
			obtenerUsuariosSchema.parse({ orden: "email", direccion: "random" }),
		).toThrow();
	});
});

describe("construirOrdenUsuario", () => {
	it("ordena por id ascendente por defecto", () => {
		expect(construirOrdenUsuario()).toEqual([{ id: "asc" }]);
	});

	it("ordena por id sin duplicar criterio cuando el campo es id", () => {
		expect(construirOrdenUsuario("id", "desc")).toEqual([{ id: "desc" }]);
	});

	it("agrega desempate por id cuando ordena por otro campo permitido", () => {
		expect(construirOrdenUsuario("email", "desc")).toEqual([
			{ email: "desc" },
			{ id: "asc" },
		]);
	});
});
