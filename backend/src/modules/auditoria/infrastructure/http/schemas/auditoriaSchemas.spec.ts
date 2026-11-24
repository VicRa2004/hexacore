import { describe, expect, it } from "bun:test";
import {
	construirOrdenAuditoria,
	construirWhereAuditoria,
} from "../../repository/PrismaAuditoriaRepository";
import {
	exportarAuditoriaSchema,
	obtenerAuditoriaSchema,
} from "./auditoriaSchemas";

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

	it("convierte desde y hasta YYYY-MM-DD al inicio y fin del día UTC", () => {
		const resultado = obtenerAuditoriaSchema.parse({
			desde: "2026-11-01",
			hasta: "2026-11-23",
		});
		expect(resultado.desde).toEqual(new Date("2026-11-01T00:00:00.000Z"));
		expect(resultado.hasta).toEqual(new Date("2026-11-23T23:59:59.999Z"));
	});

	it("acepta datetimes ISO 8601 con zona horaria", () => {
		const resultado = obtenerAuditoriaSchema.parse({
			desde: "2026-11-01T08:30:00Z",
			hasta: "2026-11-01T18:00:00-06:00",
		});
		expect(resultado.desde).toEqual(new Date("2026-11-01T08:30:00.000Z"));
		expect(resultado.hasta).toEqual(new Date("2026-11-02T00:00:00.000Z"));
	});

	it("rechaza fechas inválidas o un rango con desde posterior a hasta", () => {
		expect(() =>
			obtenerAuditoriaSchema.parse({ desde: "2026-02-30" }),
		).toThrow();
		expect(() =>
			obtenerAuditoriaSchema.parse({ hasta: "no-es-fecha" }),
		).toThrow();
		expect(() =>
			obtenerAuditoriaSchema.parse({
				desde: "2026-11-25",
				hasta: "2026-11-20",
			}),
		).toThrow();
	});
});

describe("exportarAuditoriaSchema", () => {
	it("valida filtros sin pagina ni limite y rechaza rango invertido", () => {
		expect(
			exportarAuditoriaSchema.parse({
				evento: "usuario.",
				usuarioId: "5",
				desde: "2026-11-01",
				hasta: "2026-11-23",
			}),
		).toEqual({
			evento: "usuario.",
			usuarioId: 5,
			desde: new Date("2026-11-01T00:00:00.000Z"),
			hasta: new Date("2026-11-23T23:59:59.999Z"),
		});
		expect(() =>
			exportarAuditoriaSchema.parse({
				desde: "2026-11-25",
				hasta: "2026-11-20",
			}),
		).toThrow();
	});
});

describe("construirWhereAuditoria", () => {
	it("construye filtros por prefijo de evento, usuario y rango de fechas", () => {
		const desde = new Date("2026-11-01T00:00:00.000Z");
		const hasta = new Date("2026-11-23T23:59:59.999Z");
		expect(
			construirWhereAuditoria({
				evento: "usuario.",
				usuarioId: 3,
				desde,
				hasta,
			}),
		).toEqual({
			evento: { startsWith: "usuario." },
			usuarioId: 3,
			ocurridoEn: { gte: desde, lte: hasta },
		});
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
