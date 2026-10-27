import { beforeAll, describe, expect, it } from "bun:test";
import { api, crearUsuario, login, PASSWORD, vaciarUsuarios } from "@/test/e2e";

describe("Usuarios (e2e)", () => {
	let adminToken: string;
	let tokenSinPermiso: string;

	beforeAll(async () => {
		await vaciarUsuarios();
		await crearUsuario("admin@e2e.dev", "ADMIN");
		await crearUsuario("nobody@e2e.dev");
		adminToken = await login("admin@e2e.dev");
		tokenSinPermiso = await login("nobody@e2e.dev");
	});

	it("sin token → 401", async () => {
		expect((await api("/api/usuarios")).status).toBe(401);
	});

	it("sin permiso → 403", async () => {
		const res = await api("/api/usuarios", { token: tokenSinPermiso });

		expect(res.status).toBe(403);
	});

	it("CRUD completo con permisos", async () => {
		const token = adminToken;

		const creado = await api("/api/usuarios", {
			method: "POST",
			token,
			body: { email: "bea@e2e.dev", nombre: "Bea", password: PASSWORD },
		});
		expect(creado.status).toBe(201);
		const { id } = await creado.json();

		const actualizado = await api(`/api/usuarios/${id}`, {
			method: "PUT",
			token,
			body: { nombre: "Beatriz" },
		});
		expect(actualizado.status).toBe(200);

		const encontrado = await api(`/api/usuarios/${id}`, { token });
		expect((await encontrado.json()).nombre).toBe("Beatriz");

		const lista = await api("/api/usuarios?email=bea@", { token });
		expect((await lista.json()).totalElementos).toBe(1);

		const eliminado = await api(`/api/usuarios/${id}`, {
			method: "DELETE",
			token,
		});
		expect(eliminado.status).toBe(204);
		expect((await api(`/api/usuarios/${id}`, { token })).status).toBe(404);
	});
});
