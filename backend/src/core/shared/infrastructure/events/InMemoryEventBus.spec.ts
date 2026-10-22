import "reflect-metadata";
import { describe, expect, it, mock, spyOn } from "bun:test";
import { InMemoryEventBus } from "./InMemoryEventBus";

const event = { eventName: "user.created", occurredOn: new Date(), data: {} };

describe("InMemoryEventBus", () => {
	it("debería esperar a los subscribers asíncronos", async () => {
		const bus = new InMemoryEventBus();
		let done = false;
		bus.subscribe("user.created", async () => {
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
		bus.subscribe("user.created", () => {
			throw new Error("boom");
		});
		bus.subscribe("user.created", other);

		await bus.publishAll([event]);

		expect(other).toHaveBeenCalledWith(event);
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});
});
