import { describe, expect, it, spyOn } from "bun:test";
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
	it("no debería exponer el mensaje de un error interno", async () => {
		spyOn(console, "error").mockImplementation(() => {});
		const res = await request(new Error("connect ECONNREFUSED db:5432"));

		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ error: "Internal server error" });
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
