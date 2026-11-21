import { describe, expect, it } from "vitest";
import { fechaRelativa } from "./fecha";

describe("fechaRelativa", () => {
	const ahora = new Date("2026-11-20T12:00:00Z").getTime();
	const hace = (segundos: number) =>
		new Date(ahora - segundos * 1000).toISOString();

	it("usa la unidad más grande que cabe", () => {
		expect(fechaRelativa(hace(30), ahora)).toBe("ahora mismo");
		expect(fechaRelativa(hace(5 * 60), ahora)).toBe("hace 5 minutos");
		expect(fechaRelativa(hace(3 * 3600), ahora)).toBe("hace 3 horas");
		expect(fechaRelativa(hace(24 * 3600), ahora)).toBe("ayer");
	});

	it("también hacia el futuro (caducidades)", () => {
		expect(fechaRelativa(hace(-7 * 24 * 3600), ahora)).toBe("dentro de 7 días");
	});
});
