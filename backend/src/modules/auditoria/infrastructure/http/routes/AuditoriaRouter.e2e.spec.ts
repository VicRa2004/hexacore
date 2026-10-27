import { beforeAll, describe, expect, it } from "bun:test";
import { prisma } from "@/core/config/prisma";
import { api, crearUsuario, login, PASSWORD, vaciarUsuarios } from "@/test/e2e";

describe("Auditoría y borrado lógico (e2e)", () => {
	let adminId: number;
	let adminToken: string;

	beforeAll(async () => {
		await vaciarUsuarios();
		await prisma.auditoria.deleteMany();
		adminId = (await crearUsuario("admin@e2e.dev", "ADMIN")).id;
		await crearUsuario("nobody@e2e.dev");
		adminToken = await login("admin@e2e.dev");
	});

	it("sin permiso auditoria:leer → 403", async () => {
		const token = await login("nobody@e2e.dev");

		expect((await api("/api/auditoria", { token })).status).toBe(403);
	});

	it("debería registrar quién creó y eliminó un usuario, y el eliminado no puede entrar", async () => {
		const creado = await api("/api/usuarios", {
			method: "POST",
			token: adminToken,
			body: { email: "borrar@e2e.dev", nombre: "Borrar", password: PASSWORD },
		});
		const { id } = await creado.json();
		await api(`/api/usuarios/${id}`, { method: "DELETE", token: adminToken });

		const res = await api("/api/auditoria?evento=usuario.eliminado", {
			token: adminToken,
		});
		const { datos } = await res.json();
		expect(datos).toEqual([
			expect.objectContaining({
				evento: "usuario.eliminado",
				usuarioId: adminId,
				datos: { id, email: "borrar@e2e.dev" },
				requestId: expect.any(String),
			}),
		]);

		// La fila sigue en BD, pero la app no la ve.
		expect(await prisma.usuario.findUnique({ where: { id } })).toMatchObject({
			deletedAt: expect.any(Date),
		});
		expect(
			(await api(`/api/usuarios/${id}`, { token: adminToken })).status,
		).toBe(404);
		await expect(login("borrar@e2e.dev")).rejects.toThrow("401");
	});
});
