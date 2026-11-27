import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ImagenAjusteInvalidaError } from "../../domain/error/ImagenAjusteInvalidaError";
import { ServicioAjustes } from "../services/ServicioAjustes";
import { CambiarImagenAjusteUseCase } from "./CambiarImagenAjusteUseCase";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
const ICO = new Uint8Array([0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10]);

describe("CambiarImagenAjusteUseCase", () => {
	const filas = new Map<string, unknown>();
	const repo = {
		obtenerTodos: mock(async () => new Map(filas)),
		guardarVarios: mock(
			async (entradas: { clave: string; valor: unknown }[]) => {
				for (const e of entradas) filas.set(e.clave, e.valor);
			},
		),
		eliminar: mock(async (clave: string) => {
			filas.delete(clave);
		}),
	};
	const almacenamiento = { guardar: mock(), obtener: mock(), eliminar: mock() };
	const eventBus = { publish: mock(async () => {}) };
	const uow = { ejecutar: <T>(fn: () => Promise<T>) => fn() };
	let useCase: CambiarImagenAjusteUseCase;

	beforeEach(() => {
		filas.clear();
		for (const fn of [
			...Object.values(repo),
			...Object.values(almacenamiento),
			eventBus.publish,
		]) {
			fn.mockClear();
		}
		const servicio = new ServicioAjustes(
			repo as never,
			"App <no-reply@app.dev>",
		);
		useCase = new CambiarImagenAjusteUseCase(
			repo as never,
			servicio,
			almacenamiento as never,
			eventBus as never,
			uow as never,
		);
	});

	it("guarda el logo PNG, borra el anterior y devuelve la URL", async () => {
		filas.set("logoClave", "ajustes/logo-anterior.png");

		const dto = await useCase.ejecutar("logo", PNG);

		const [clave, , mime] = almacenamiento.guardar.mock.calls[0] ?? [];
		expect(clave).toMatch(/^ajustes\/logo-[\w-]+\.png$/);
		expect(mime).toBe("image/png");
		expect(almacenamiento.eliminar).toHaveBeenCalledWith(
			"ajustes/logo-anterior.png",
		);
		expect(dto.logoUrl).toBe(
			`/api/ajustes/logo?v=${encodeURIComponent(clave)}`,
		);
	});

	it("acepta formato ICO para el favicon", async () => {
		const dto = await useCase.ejecutar("favicon", ICO);

		const [clave, , mime] = almacenamiento.guardar.mock.calls[0] ?? [];
		expect(clave).toMatch(/^ajustes\/favicon-[\w-]+\.ico$/);
		expect(mime).toBe("image/x-icon");
		expect(dto.faviconUrl).toContain("/api/ajustes/favicon?v=");
	});

	it("rechaza SVG y archivos inválidos sin guardar en almacenamiento", async () => {
		await expect(
			useCase.ejecutar("logo", new TextEncoder().encode("<svg/>")),
		).rejects.toBeInstanceOf(ImagenAjusteInvalidaError);
		expect(almacenamiento.guardar).not.toHaveBeenCalled();
	});

	it("limpia el archivo recién subido si falla la escritura en BD", async () => {
		repo.guardarVarios.mockRejectedValueOnce(new Error("fallo bd"));

		await expect(useCase.ejecutar("logo", PNG)).rejects.toThrow("fallo bd");
		const [clave] = almacenamiento.guardar.mock.calls[0] ?? [];
		expect(almacenamiento.eliminar).toHaveBeenCalledWith(clave);
	});

	it("con null elimina la clave y borra el archivo anterior", async () => {
		filas.set("faviconClave", "ajustes/favicon-viejo.ico");

		const dto = await useCase.ejecutar("favicon", null);

		expect(dto.faviconUrl).toBeNull();
		expect(repo.eliminar).toHaveBeenCalledWith("faviconClave");
		expect(almacenamiento.eliminar).toHaveBeenCalledWith(
			"ajustes/favicon-viejo.ico",
		);
	});
});
