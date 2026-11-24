import { describe, expect, it } from "vitest";
import {
	normalizarBusqueda,
	sincronizarValorDesdeUrl,
} from "./useBusquedaDebounced";

describe("useBusquedaDebounced", () => {
	describe("normalizarBusqueda", () => {
		it("recorta espacios y convierte vacío o undefined en undefined", () => {
			expect(normalizarBusqueda(undefined)).toBeUndefined();
			expect(normalizarBusqueda("")).toBeUndefined();
			expect(normalizarBusqueda("   ")).toBeUndefined();
			expect(normalizarBusqueda("  juan  ")).toBe("juan");
		});
	});

	describe("sincronizarValorDesdeUrl", () => {
		it("conserva el espacio final cuando la URL confirma el mismo valor normalizado", () => {
			expect(sincronizarValorDesdeUrl("juan ", "juan")).toBe("juan ");
			expect(sincronizarValorDesdeUrl("  juan ", "juan")).toBe("  juan ");
			expect(sincronizarValorDesdeUrl("   ", undefined)).toBe("   ");
		});

		it("actualiza el input cuando la URL cambia externamente", () => {
			expect(sincronizarValorDesdeUrl("juan perez", "juan")).toBe("juan");
			expect(sincronizarValorDesdeUrl("juan", undefined)).toBe("");
		});
	});
});
