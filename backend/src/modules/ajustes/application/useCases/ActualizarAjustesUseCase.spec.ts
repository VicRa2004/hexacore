import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ServicioAjustes } from "../services/ServicioAjustes";
import { ActualizarAjustesUseCase } from "./ActualizarAjustesUseCase";

describe("ActualizarAjustesUseCase", () => {
	const filas = new Map<string, unknown>();
	const repo = {
		obtenerTodos: mock(async () => new Map(filas)),
		guardarVarios: mock(
			async (entradas: { clave: string; valor: unknown }[]) => {
				for (const e of entradas) filas.set(e.clave, e.valor);
			},
		),
		eliminar: mock(),
	};
	const eventBus = { publish: mock(async () => {}) };
	const uow = { ejecutar: <T>(fn: () => Promise<T>) => fn() };
	let servicio: ServicioAjustes;
	let useCase: ActualizarAjustesUseCase;

	beforeEach(() => {
		filas.clear();
		repo.obtenerTodos.mockClear();
		repo.guardarVarios.mockClear();
		eventBus.publish.mockClear();
		servicio = new ServicioAjustes(repo as never, "App <no-reply@app.dev>");
		useCase = new ActualizarAjustesUseCase(
			repo as never,
			servicio,
			eventBus as never,
			uow as never,
		);
	});

	it("persiste los cambios, publica el evento e invalida la caché", async () => {
		const iniciales = await servicio.obtener();
		expect(iniciales.nombreApp).toBe("Hexacore");

		const actualizado = await useCase.ejecutar({
			nombreApp: "  Portal Nuevo  ",
			colorMarca: 160,
			registroPublicoAbierto: false,
		});

		expect(actualizado).toEqual({
			nombreApp: "Portal Nuevo",
			colorMarca: 160,
			remitenteCorreo: "App <no-reply@app.dev>",
			registroPublicoAbierto: false,
			logoUrl: null,
			faviconUrl: null,
		});
		expect(eventBus.publish).toHaveBeenCalledWith(
			expect.objectContaining({
				eventName: "ajustes.actualizados",
				data: {
					claves: ["nombreApp", "colorMarca", "registroPublicoAbierto"],
				},
			}),
		);
		expect(repo.obtenerTodos).toHaveBeenCalledTimes(2);
	});

	it("rechaza una actualización vacía con error de validación", async () => {
		await expect(useCase.ejecutar({})).rejects.toThrow("al menos un ajuste");
		expect(repo.guardarVarios).not.toHaveBeenCalled();
	});
});
