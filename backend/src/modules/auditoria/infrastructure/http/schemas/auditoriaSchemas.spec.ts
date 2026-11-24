import { describe, expect, it } from "bun:test";
import { obtenerAuditoriaSchema } from "./auditoriaSchemas";
import { construirOrdenAuditoria } from "../../repository/PrismaAuditoriaRepository";

describe("obtenerAuditoriaSchema", () => {
	it("acepta campos de orden de la lista blanca y dirección válida", () => {
		expect(
			obtenerAuditoriaSchema.parse({
				orden: "ocurridoEn",
				direccion: "asc",
			}),
		).toEqual({
			pagina: 1,
			limite: 20,
			orden: "ocurridoEn",
			direccion: "asc",
		});
	});

	it("rechaza campos fuera de la lista blanca y direcciones inválidas", () => {
		expect(() => obtenerAuditoriaSchema.parse({ orden: "datos" })).toThrow();
		expect(() =>
			obtenerAuditoriaSchema.parse({ orden: "evento", direccion: "up" }),
		).toThrow();
	});
});

describe("construirOrdenAuditoria", () => {
	it("ordena por id descendente por defecto", () => {
		expect(construirOrdenAuditoria()).toEqual([{ id: "desc" }]);
	});

	it("ordena por id sin duplicar criterio cuando el campo es id", () => {
		expect(construirOrdenAuditoria("id", "asc")).toEqual([{ id: "asc" }]);
	});

	it("agrega desempate por id descendente cuando ordena por otro campo permitido", () => {
		expect(construirOrdenAuditoria("evento", "asc")).toEqual([
			{ evento: "asc" },
			{ id: "desc" },
		]);
	});
});
