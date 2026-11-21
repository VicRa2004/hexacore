import { describe, expect, it } from "vitest";
import { matrizPermisos } from "./matrizPermisos";

describe("matrizPermisos", () => {
	it("une las acciones en columnas y deja huecos donde el recurso no la tiene", () => {
		const { acciones, filas } = matrizPermisos([
			{ id: 1, recurso: "usuarios", accion: "crear" },
			{ id: 2, recurso: "usuarios", accion: "leer" },
			{ id: 3, recurso: "auditoria", accion: "leer" },
		]);
		expect(acciones).toEqual(["crear", "leer"]);
		expect(filas.map((f) => [f.recurso, f.celdas.map((c) => c?.id)])).toEqual([
			["usuarios", [1, 2]],
			["auditoria", [undefined, 3]],
		]);
	});
});
