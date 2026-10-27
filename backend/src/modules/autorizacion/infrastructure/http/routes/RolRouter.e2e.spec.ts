import { beforeAll, describe, expect, it } from "bun:test";
import { api, crearUsuario, login, vaciarUsuarios } from "@/test/e2e";

describe("Roles y asignaciones (e2e)", () => {
	let adminToken: string;
	let usuarioId: number;
	let tokenSinPermiso: string;

	beforeAll(async () => {
		await vaciarUsuarios();
		await crearUsuario("admin@e2e.dev", "ADMIN");
		usuarioId = (await crearUsuario("ana@e2e.dev")).id;
		adminToken = await login("admin@e2e.dev");
		tokenSinPermiso = await login("ana@e2e.dev");
	});

	it("sin permiso → 403", async () => {
		const res = await api("/api/roles", { token: tokenSinPermiso });

		expect(res.status).toBe(403);
	});

	it("crear rol → asignarlo → el usuario gana y pierde permisos", async () => {
		const token = adminToken;
		const permisos: { id: number; recurso: string; accion: string }[] = await (
			await api("/api/permisos", { token })
		).json();
		const leerUsuarios = permisos.find(
			(p) => p.recurso === "usuarios" && p.accion === "leer",
		);
		if (!leerUsuarios) throw new Error("El seed no trae usuarios:leer");

		const creado = await api("/api/roles", {
			method: "POST",
			token,
			body: { nombre: " soporte ", permisoIds: [leerUsuarios.id] },
		});
		expect(creado.status).toBe(201);
		const rol = await creado.json();
		expect(rol.nombre).toBe("SOPORTE");

		const duplicado = await api("/api/roles", {
			method: "POST",
			token,
			body: { nombre: "SOPORTE" },
		});
		expect(duplicado.status).toBe(409);

		const asignacion = {
			rolIds: [rol.id],
			permisosDirectos: [],
		};
		const asignar = await api(`/api/asignaciones/usuarios/${usuarioId}`, {
			method: "PUT",
			token,
			body: asignacion,
		});
		expect(asignar.status).toBe(200);
		expect(
			await (
				await api(`/api/asignaciones/usuarios/${usuarioId}`, { token })
			).json(),
		).toEqual(asignacion);
		expect(
			(await api("/api/usuarios", { token: tokenSinPermiso })).status,
		).toBe(200);

		// Un permiso directo denegado gana al del rol.
		await api(`/api/asignaciones/usuarios/${usuarioId}`, {
			method: "PUT",
			token,
			body: {
				rolIds: [rol.id],
				permisosDirectos: [{ permisoId: leerUsuarios.id, concedido: false }],
			},
		});
		expect(
			(await api("/api/usuarios", { token: tokenSinPermiso })).status,
		).toBe(403);

		const enUso = await api(`/api/roles/${rol.id}`, {
			method: "DELETE",
			token,
		});
		expect(enUso.status).toBe(409);

		await api(`/api/asignaciones/usuarios/${usuarioId}`, {
			method: "PUT",
			token,
			body: { rolIds: [], permisosDirectos: [] },
		});
		const eliminado = await api(`/api/roles/${rol.id}`, {
			method: "DELETE",
			token,
		});
		expect(eliminado.status).toBe(204);
		expect((await api(`/api/roles/${rol.id}`, { token })).status).toBe(404);
	});

	it("asignar un rol inexistente → 404 y no toca la asignación", async () => {
		const res = await api(`/api/asignaciones/usuarios/${usuarioId}`, {
			method: "PUT",
			token: adminToken,
			body: { rolIds: [99999], permisosDirectos: [] },
		});

		expect(res.status).toBe(404);
	});
});
