import { describe, expect, it } from "vitest";
import { estadoPaso, normalizarPasoActual } from "./Pasos";

describe("Pasos", () => {
	describe("normalizarPasoActual", () => {
		it("acota valores fuera de rango y maneja listas vacías", () => {
			expect(normalizarPasoActual(0, 0)).toBe(0);
			expect(normalizarPasoActual(-2, 3)).toBe(0);
			expect(normalizarPasoActual(Number.NaN, 3)).toBe(0);
			expect(normalizarPasoActual(5, 3)).toBe(2);
			expect(normalizarPasoActual(1.8, 3)).toBe(1);
			expect(normalizarPasoActual(1, 3)).toBe(1);
		});
	});

	describe("estadoPaso", () => {
		it("devuelve completado, actual o pendiente según el paso activo", () => {
			expect(estadoPaso(0, 1)).toBe("completado");
			expect(estadoPaso(1, 1)).toBe("actual");
			expect(estadoPaso(2, 1)).toBe("pendiente");
		});
	});
});
