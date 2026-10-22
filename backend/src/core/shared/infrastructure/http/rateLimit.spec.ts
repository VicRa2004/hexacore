import { describe, expect, it } from "bun:test";
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
});
