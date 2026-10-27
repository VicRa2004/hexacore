import { describe, expect, it, mock, spyOn } from "bun:test";
import { InMemoryEventBus } from "./InMemoryEventBus";

const event = { eventName: "usuario.creado", occurredOn: new Date(), data: {} };

describe("InMemoryEventBus", () => {
	it("debería esperar a los subscribers asíncronos", async () => {
		const bus = new InMemoryEventBus();
		let done = false;
		bus.subscribe("usuario.creado", async () => {
			await Bun.sleep(1);
			done = true;
		});

		await bus.publish(event);

		expect(done).toBe(true);
	});

	it("no debería propagar el error de un subscriber ni frenar a los demás", async () => {
		const bus = new InMemoryEventBus();
		const consoleError = spyOn(console, "error").mockImplementation(() => {});
		const other = mock();
		bus.subscribe("usuario.creado", () => {
			throw new Error("boom");
		});
		bus.subscribe("usuario.creado", other);

		await bus.publishAll([event]);

		expect(other).toHaveBeenCalledWith(event);
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});
});

describe("InMemoryEventBus: comodín y meta", () => {
	it("debería entregar a '*' todos los eventos con el contexto de la petición", async () => {
		const { contexto } = await import("@/core/shared/infrastructure/contexto");
		const bus = new InMemoryEventBus();
		const todos = mock();
		bus.subscribe("*", todos);

		await contexto.ejecutar({ requestId: "req-1", usuarioId: 7 }, () =>
			bus.publish({ eventName: "x", occurredOn: new Date(), data: {} }),
		);

		expect(todos).toHaveBeenCalledWith(
			expect.objectContaining({ meta: { requestId: "req-1", usuarioId: 7 } }),
		);
	});
});
