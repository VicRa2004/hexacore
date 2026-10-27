import { describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import { RequierePermisoMiddleware } from "./RequierePermisoMiddleware";

const buildApp = (permisos: { recurso: string; accion: string }[]) => {
	const obtenerPermisosUsuario = { ejecutar: mock(async () => permisos) };
	const middleware = new RequierePermisoMiddleware(
		obtenerPermisosUsuario as never,
	);
	const app = new Hono();
	app.use(async (c, next) => {
		c.set("usuario" as never, { id: 1, email: "a@x.com", roles: [] } as never);
		await next();
	});
	app.get(
		"/",
		middleware.handle("usuarios", "leer"),
		middleware.handle("usuarios", "actualizar"),
		(c) => c.text("ok"),
	);
	return { app, obtenerPermisosUsuario };
};

describe("RequierePermisoMiddleware", () => {
	it("debería consultar los permisos una sola vez por petición", async () => {
		const { app, obtenerPermisosUsuario } = buildApp([
			{ recurso: "usuarios", accion: "leer" },
			{ recurso: "usuarios", accion: "actualizar" },
		]);

		const res = await app.request("/");

		expect(res.status).toBe(200);
		expect(obtenerPermisosUsuario.ejecutar).toHaveBeenCalledTimes(1);
	});

	it("debería responder 403 si falta alguno de los permisos", async () => {
		const { app } = buildApp([{ recurso: "usuarios", accion: "leer" }]);

		const res = await app.request("/");

		expect(res.status).toBe(403);
	});
});
