import { afterEach, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { rateLimit } from "./rateLimit";

describe("rateLimit", () => {
	it("debería responder 429 al superar el límite dentro de la ventana", async () => {
		const app = new Hono();
		app.post("/", rateLimit({ windowMs: 60_000, limit: 2 }), (c) =>
			c.text("ok"),
		);

		const statuses = [];
		for (let i = 0; i < 3; i++) {
			statuses.push((await app.request("/", { method: "POST" })).status);
		}

		expect(statuses).toEqual([200, 200, 429]);
	});

	it("debería reiniciar el contador al acabar la ventana", async () => {
		const app = new Hono();
		app.post("/", rateLimit({ windowMs: 1, limit: 1 }), (c) => c.text("ok"));

		await app.request("/", { method: "POST" });
		await Bun.sleep(5);
		const res = await app.request("/", { method: "POST" });

		expect(res.status).toBe(200);
	});

	describe("con TRUST_PROXY", () => {
		afterEach(() => {
			delete process.env.TRUST_PROXY;
		});

		const limitedApp = () => {
			const app = new Hono();
			app.post("/", rateLimit({ windowMs: 60_000, limit: 1 }), (c) =>
				c.text("ok"),
			);
			return (xff: string) =>
				app.request("/", {
					method: "POST",
					headers: { "x-forwarded-for": xff },
				});
		};

		it("debería contar por la última IP de X-Forwarded-For", async () => {
			process.env.TRUST_PROXY = "true";
			const send = limitedApp();

			await send("1.1.1.1, 10.0.0.1");
			// El cliente cambia la parte que controla, pero el proxy añade la misma IP.
			const res = await send("2.2.2.2, 10.0.0.1");
			const other = await send("10.0.0.2");

			expect(res.status).toBe(429);
			expect(other.status).toBe(200);
		});

		it("debería ignorar X-Forwarded-For sin TRUST_PROXY", async () => {
			const send = limitedApp();

			await send("10.0.0.1");
			const res = await send("10.0.0.2");

			expect(res.status).toBe(429);
		});
	});
});
