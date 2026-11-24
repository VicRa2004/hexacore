import { describe, expect, it } from "bun:test";
import {
	CABECERA_CSV_AUDITORIA,
	escaparCeldaCsv,
	formatearFilaAuditoriaCsv,
} from "./csv";

describe("escaparCeldaCsv", () => {
	it("devuelve cadena vacía para null y undefined", () => {
		expect(escaparCeldaCsv(null)).toBe("");
		expect(escaparCeldaCsv(undefined)).toBe("");
	});

	it("convierte fechas a ISO y objetos a JSON", () => {
		const fecha = new Date("2026-11-23T12:00:00.000Z");
		expect(escaparCeldaCsv(fecha)).toBe("2026-11-23T12:00:00.000Z");
		expect(escaparCeldaCsv({ a: 1 })).toBe('"{""a"":1}"');
	});

	it("escapa comillas, comas y saltos de línea según RFC 4180", () => {
		expect(escaparCeldaCsv('hola "mundo"')).toBe('"hola ""mundo"""');
		expect(escaparCeldaCsv("a,b,c")).toBe('"a,b,c"');
		expect(escaparCeldaCsv("linea1\nlinea2")).toBe('"linea1\nlinea2"');
		expect(escaparCeldaCsv("linea1\r\nlinea2")).toBe('"linea1\r\nlinea2"');
	});

	it("neutraliza inyección de fórmulas (=, +, -, @, tab, cr)", () => {
		expect(escaparCeldaCsv("=CMD('calc')")).toBe("'=CMD('calc')");
		expect(escaparCeldaCsv("+1+1")).toBe("'+1+1");
		expect(escaparCeldaCsv("-2+3")).toBe("'-2+3");
		expect(escaparCeldaCsv("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
		expect(escaparCeldaCsv("\t=1")).toBe("'\t=1");
		expect(escaparCeldaCsv("\r=1")).toBe('"\'\r=1"');
		expect(escaparCeldaCsv('=HYPERLINK("http://x","a")')).toBe(
			`"'=HYPERLINK(""http://x"",""a"")"`,
		);
	});
});

describe("formatearFilaAuditoriaCsv", () => {
	it("formatea la fila respetando el orden de la cabecera", () => {
		expect(CABECERA_CSV_AUDITORIA).toBe(
			"id,ocurridoEn,evento,usuarioId,requestId,datos",
		);
		const fila = formatearFilaAuditoriaCsv({
			id: 42,
			ocurridoEn: new Date("2026-11-23T10:00:00.000Z"),
			evento: "usuario.creado",
			usuarioId: 7,
			requestId: "req-1",
			datos: { nota: "=1+1, ok" },
		});
		expect(fila).toBe(
			'42,2026-11-23T10:00:00.000Z,usuario.creado,7,req-1,"{""nota"":""=1+1, ok""}"',
		);
	});
});
