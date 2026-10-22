import { beforeAll, describe, expect, it } from "bun:test";
import { api, createUser, login, PASSWORD, resetUsers } from "@/test/e2e";

describe("Users (e2e)", () => {
	let adminToken: string;
	let noPermissionToken: string;

	beforeAll(async () => {
		await resetUsers();
		await createUser("admin@e2e.dev", "ADMIN");
		await createUser("nobody@e2e.dev");
		adminToken = await login("admin@e2e.dev");
		noPermissionToken = await login("nobody@e2e.dev");
	});

	it("sin token → 401", async () => {
		expect((await api("/api/users")).status).toBe(401);
	});

	it("sin permiso → 403", async () => {
		const res = await api("/api/users", { token: noPermissionToken });

		expect(res.status).toBe(403);
	});

	it("CRUD completo con permisos", async () => {
		const token = adminToken;

		const created = await api("/api/users", {
			method: "POST",
			token,
			body: { email: "bea@e2e.dev", name: "Bea", password: PASSWORD },
		});
		expect(created.status).toBe(201);
		const { id } = await created.json();

		const updated = await api(`/api/users/${id}`, {
			method: "PUT",
			token,
			body: { name: "Beatriz" },
		});
		expect(updated.status).toBe(200);

		const found = await api(`/api/users/${id}`, { token });
		expect((await found.json()).name).toBe("Beatriz");

		const list = await api("/api/users?email=bea@", { token });
		expect((await list.json()).totalItems).toBe(1);

		const deleted = await api(`/api/users/${id}`, { method: "DELETE", token });
		expect(deleted.status).toBe(204);
		expect((await api(`/api/users/${id}`, { token })).status).toBe(404);
	});
});
