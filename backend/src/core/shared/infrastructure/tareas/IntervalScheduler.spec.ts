import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { IntervalScheduler } from "./IntervalScheduler";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("IntervalScheduler", () => {
	const scheduler = new IntervalScheduler();
	afterEach(() => scheduler.detener());

	it("no solapa una ejecución con la anterior", async () => {
		let ejecuciones = 0;
		scheduler.programar("lenta", 5, async () => {
			ejecuciones++;
			await esperar(40);
		});

		await esperar(30);

		expect(ejecuciones).toBe(1);
	});

	it("sigue ejecutando la tarea aunque falle", async () => {
		const consola = spyOn(console, "error").mockImplementation(() => {});
		let intentos = 0;
		scheduler.programar("rota", 5, async () => {
			intentos++;
			throw new Error("fallo");
		});

		await esperar(30);

		expect(intentos).toBeGreaterThan(1);
		consola.mockRestore();
	});

	it("detener para todas las tareas", async () => {
		let ejecuciones = 0;
		scheduler.programar("contador", 5, async () => {
			ejecuciones++;
		});
		scheduler.detener();

		await esperar(20);

		expect(ejecuciones).toBe(0);
	});
});
