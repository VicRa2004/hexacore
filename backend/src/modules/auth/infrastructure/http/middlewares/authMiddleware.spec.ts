import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { AuthMiddleware, type AuthEnv } from "./authMiddleware";

const payload = { id: 1, email: "a@x.com", roles: ["USUARIO"] };

const tokenService = {
	verificarToken: (token: string) => {
		if (token !== "valido") throw new Error("jwt malformed");
		return payload;
	},
};

const app = new Hono<AuthEnv>();
app.get("/", new AuthMiddleware(tokenService as never).handle, (c) =>
	c.json(c.get("usuario")),
);

const request = (autorizacion?: string) =>
	app.request("/", {
		headers: autorizacion ? { Authorization: autorizacion } : {},
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
	])("debería responder 401 %s", async (_, autorizacion) => {
		const res = await request(autorizacion);

		expect(res.status).toBe(401);
	});
});
