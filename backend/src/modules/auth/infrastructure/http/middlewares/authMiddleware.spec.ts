import "reflect-metadata";
import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { AuthMiddleware, type AuthEnv } from "./authMiddleware";

const payload = { id: 1, email: "a@x.com", roles: ["USER"] };

const tokenService = {
	verifyToken: (token: string) => {
		if (token !== "valido") throw new Error("jwt malformed");
		return payload;
	},
};

const app = new Hono<AuthEnv>();
app.get("/", new AuthMiddleware(tokenService as never).handle, (c) =>
	c.json(c.get("user")),
);

const request = (authorization?: string) =>
	app.request("/", {
		headers: authorization ? { Authorization: authorization } : {},
	});

describe("AuthMiddleware", () => {
	it("debería publicar el usuario del token en el contexto", async () => {
		const res = await request("Bearer valido");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual(payload);
	});

	it.each([
		["sin header", undefined],
		["sin esquema Bearer", "valido"],
		["Bearer vacío", "Bearer "],
		["token inválido", "Bearer otro"],
	])("debería responder 401 %s", async (_, authorization) => {
		const res = await request(authorization);

		expect(res.status).toBe(401);
	});
});
