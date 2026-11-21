import { describe, expect, it } from "vitest";
import { tienePermiso } from "./permisos";

describe("tienePermiso", () => {
	it("sin módulo de autorización (null) permite todo", () => {
		expect(tienePermiso(null, "usuarios:crear")).toBe(true);
	});

	it("mientras carga (undefined) no permite nada", () => {
		expect(tienePermiso(undefined, "usuarios:crear")).toBe(false);
	});

	it("comprueba recurso y acción exactos", () => {
		const permisos = ["usuarios:leer"];
		expect(tienePermiso(permisos, "usuarios:leer")).toBe(true);
		expect(tienePermiso(permisos, "usuarios:crear")).toBe(false);
	});
});
