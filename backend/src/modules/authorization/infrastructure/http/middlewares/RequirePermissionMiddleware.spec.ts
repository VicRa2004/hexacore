import "reflect-metadata";
import { describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import { RequirePermissionMiddleware } from "./RequirePermissionMiddleware";

const buildApp = (permissions: { resource: string; action: string }[]) => {
	const getUserPermissions = { run: mock(async () => permissions) };
	const middleware = new RequirePermissionMiddleware(
		getUserPermissions as never,
	);
	const app = new Hono();
	app.use(async (c, next) => {
		c.set("user" as never, { id: 1, email: "a@x.com", roles: [] } as never);
		await next();
	});
	app.get(
		"/",
		middleware.handle("users", "read"),
		middleware.handle("users", "update"),
		(c) => c.text("ok"),
	);
	return { app, getUserPermissions };
};

describe("RequirePermissionMiddleware", () => {
	it("debería consultar los permisos una sola vez por petición", async () => {
		const { app, getUserPermissions } = buildApp([
			{ resource: "users", action: "read" },
			{ resource: "users", action: "update" },
		]);

		const res = await app.request("/");

		expect(res.status).toBe(200);
		expect(getUserPermissions.run).toHaveBeenCalledTimes(1);
	});

	it("debería responder 403 si falta alguno de los permisos", async () => {
		const { app } = buildApp([{ resource: "users", action: "read" }]);

		const res = await app.request("/");

		expect(res.status).toBe(403);
	});
});
