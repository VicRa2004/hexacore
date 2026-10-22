import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { Prisma } from "@/generated/prisma/client";
import { BaseController } from "./base.controller";

class ThrowingController extends BaseController {
	constructor(private readonly error: unknown) {
		super();
	}

	run = (c: Parameters<BaseController["ok"]>[0]) =>
		this.executeSafely(c, async () => {
			throw this.error;
		});
}

const request = (error: unknown) => {
	const app = new Hono();
	app.get("/", new ThrowingController(error).run);
	return app.request("/");
};

describe("BaseController.handleError", () => {
	it("debería propagar los errores inesperados al onError global", async () => {
		const app = new Hono();
		app.get("/", new ThrowingController(new Error("boom")).run);
		app.onError((err, c) => c.json({ error: err.message }, 500));

		const res = await app.request("/");

		expect(await res.json()).toEqual({ error: "boom" });
	});

	it("debería responder 409 ante una violación de clave foránea de Prisma", async () => {
		const error = new Prisma.PrismaClientKnownRequestError("fk", {
			code: "P2003",
			clientVersion: "7",
		});

		const res = await request(error);

		expect(res.status).toBe(409);
	});
});
