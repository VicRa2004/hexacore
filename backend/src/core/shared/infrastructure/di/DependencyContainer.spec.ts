import { describe, expect, it } from "bun:test";
import { DependencyContainer, token } from "./DependencyContainer";

const NUMBER = token<{ value: number }>("Number");

describe("DependencyContainer", () => {
	it("crea la instancia una sola vez y en diferido", () => {
		const c = new DependencyContainer();
		let calls = 0;
		c.set(NUMBER, () => ({ value: ++calls }));

		expect(calls).toBe(0);
		expect(c.get(NUMBER)).toBe(c.get(NUMBER));
		expect(calls).toBe(1);
	});

	it("un registro posterior sustituye al anterior", () => {
		const c = new DependencyContainer();
		c.set(NUMBER, () => ({ value: 1 }));
		c.get(NUMBER);
		c.set(NUMBER, () => ({ value: 2 }));

		expect(c.get(NUMBER).value).toBe(2);
	});

	it("falla con el nombre del token si no está registrado", () => {
		expect(() => new DependencyContainer().get(NUMBER)).toThrow("Number");
	});
});
