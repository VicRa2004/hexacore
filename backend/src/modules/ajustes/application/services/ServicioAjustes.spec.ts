import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ServicioAjustes } from "./ServicioAjustes";

describe("ServicioAjustes", () => {
	const repo = {
		obtenerTodos: mock(),
		guardarVarios: mock(),
		eliminar: mock(),
	};
	let servicio: ServicioAjustes;

	beforeEach(() => {
		repo.obtenerTodos.mockReset();
		servicio = new ServicioAjustes(
			repo as never,
			"Hexacore <no-reply@test.dev>",
		);
	});

	it("devuelve los valores por defecto cuando no hay filas en BD", async () => {
		repo.obtenerTodos.mockResolvedValue(new Map());

		const valores = await servicio.obtener();

		expect(valores).toEqual({
			nombreApp: "Hexacore",
			colorMarca: 277,
			remitenteCorreo: "Hexacore <no-reply@test.dev>",
			registroPublicoAbierto: true,
			logoClave: null,
			faviconClave: null,
		});
	});

	it("aplica valores válidos de BD y hace fallback seguro ante valores corruptos", async () => {
		repo.obtenerTodos.mockResolvedValue(
			new Map<string, unknown>([
				["nombreApp", "Mi App"],
				["colorMarca", 999],
				["remitenteCorreo", "sin-arroba"],
				["registroPublicoAbierto", false],
				["logoClave", "ajustes/logo-1.png"],
			]),
		);

		const valores = await servicio.obtener();

		expect(valores).toEqual({
			nombreApp: "Mi App",
			colorMarca: 277,
			remitenteCorreo: "Hexacore <no-reply@test.dev>",
			registroPublicoAbierto: false,
			logoClave: "ajustes/logo-1.png",
			faviconClave: null,
		});
	});

	it("cachea en memoria y vuelve a leer tras invalidar", async () => {
		repo.obtenerTodos.mockResolvedValue(
			new Map<string, unknown>([["nombreApp", "Primera"]]),
		);

		const [a, b] = await Promise.all([servicio.obtener(), servicio.obtener()]);
		const c = await servicio.obtener();

		expect(a.nombreApp).toBe("Primera");
		expect(b.nombreApp).toBe("Primera");
		expect(c.nombreApp).toBe("Primera");
		expect(repo.obtenerTodos).toHaveBeenCalledTimes(1);

		servicio.invalidar();
		repo.obtenerTodos.mockResolvedValue(
			new Map<string, unknown>([["nombreApp", "Segunda"]]),
		);

		const d = await servicio.obtener();
		expect(d.nombreApp).toBe("Segunda");
		expect(repo.obtenerTodos).toHaveBeenCalledTimes(2);
	});
});
