import { beforeAll, describe, expect, it } from "bun:test";
import { prisma } from "@/core/config/prisma";
import { api, crearUsuario, login, PASSWORD, vaciarUsuarios } from "@/test/e2e";
import { PrismaAuditoriaRepository } from "../../repository/PrismaAuditoriaRepository";

describe("Auditoría y borrado lógico (e2e)", () => {
	let adminId: number;
	let nobodyId: number;
	let adminToken: string;

	beforeAll(async () => {
		await vaciarUsuarios();
		await prisma.auditoria.deleteMany();
		adminId = (await crearUsuario("admin@e2e.dev", "ADMIN")).id;
		nobodyId = (await crearUsuario("nobody@e2e.dev")).id;
		adminToken = await login("admin@e2e.dev");
	});

	it("sin permiso auditoria:leer → 403 en listado y exportación", async () => {
		const token = await login("nobody@e2e.dev");

		expect((await api("/api/auditoria", { token })).status).toBe(403);
		expect((await api("/api/auditoria/exportar", { token })).status).toBe(403);
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

	it("filtra por rango de fechas (desde/hasta) y valida rangos inválidos", async () => {
		await prisma.auditoria.deleteMany();
		await prisma.auditoria.createMany({
			data: [
				{
					evento: "prueba.antigua",
					datos: { paso: 1 },
					usuarioId: adminId,
					requestId: "req-1",
					ocurridoEn: new Date("2026-10-01T10:00:00.000Z"),
				},
				{
					evento: "prueba.en_rango",
					datos: { paso: 2 },
					usuarioId: adminId,
					requestId: "req-2",
					ocurridoEn: new Date("2026-10-15T23:59:59.000Z"),
				},
				{
					evento: "prueba.fuera",
					datos: { paso: 3 },
					usuarioId: nobodyId,
					requestId: "req-3",
					ocurridoEn: new Date("2026-10-20T00:00:00.000Z"),
				},
			],
		});

		const res = await api(
			"/api/auditoria?desde=2026-10-10&hasta=2026-10-15&evento=prueba.",
			{ token: adminToken },
		);
		expect(res.status).toBe(200);
		const cuerpo = await res.json();
		expect(cuerpo.datos).toHaveLength(1);
		expect(cuerpo.datos[0]?.evento).toBe("prueba.en_rango");

		const resInvalido = await api(
			"/api/auditoria?desde=2026-10-20&hasta=2026-10-10",
			{ token: adminToken },
		);
		expect(resInvalido.status).toBe(400);
	});

	it("exporta CSV en streaming respetando filtros, escapado/fórmulas y audita la exportación", async () => {
		await prisma.auditoria.deleteMany();
		await prisma.auditoria.createMany({
			data: [
				{
					evento: '=CMD("calc")',
					datos: { texto: 'hola, "mundo"\nlinea2' },
					usuarioId: adminId,
					requestId: "+1+1",
					ocurridoEn: new Date("2026-11-10T12:00:00.000Z"),
				},
				{
					evento: "@SUM(A1)",
					datos: { signo: "-2" },
					usuarioId: adminId,
					requestId: "-req",
					ocurridoEn: new Date("2026-11-11T12:00:00.000Z"),
				},
				{
					evento: "otro.evento",
					datos: {},
					usuarioId: nobodyId,
					requestId: "req-otro",
					ocurridoEn: new Date("2026-11-11T12:00:00.000Z"),
				},
			],
		});

		// Verifica iteración por cursor en múltiples lotes sobre BD real.
		const repo = new PrismaAuditoriaRepository();
		const tamanosLote: number[] = [];
		for await (const lote of repo.iterarLotes({}, 2)) {
			tamanosLote.push(lote.length);
		}
		expect(tamanosLote).toEqual([2, 1]);

		const res = await api(
			`/api/auditoria/exportar?usuarioId=${adminId}&desde=2026-11-10&hasta=2026-11-11&orden=id&direccion=asc`,
			{ token: adminToken },
		);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/csv");
		expect(res.headers.get("content-disposition")).toMatch(
			/attachment; filename="auditoria-\d{4}-\d{2}-\d{2}\.csv"/,
		);

		const csv = await res.text();
		expect(csv).toContain("id,ocurridoEn,evento,usuarioId,requestId,datos\r\n");
		expect(csv).toContain(`"'=CMD(""calc"")"`);
		expect(csv).toContain("'+1+1");
		expect(csv).toContain("'@SUM(A1)");
		expect(csv).toContain("'-req");
		expect(csv).toContain('"{""texto"":""hola, \\""mundo\\""\\nlinea2""}"');
		expect(csv).not.toContain("otro.evento");
		// La propia exportación no debe aparecer dentro del CSV recién descargado.
		expect(csv).not.toContain("auditoria.exportada");

		// Pero sí debe quedar registrada como evento auditado en la BD.
		const eventosExportacion = await prisma.auditoria.findMany({
			where: { evento: "auditoria.exportada" },
		});
		expect(eventosExportacion).toHaveLength(1);
		expect(eventosExportacion[0]).toMatchObject({
			evento: "auditoria.exportada",
			usuarioId: adminId,
			requestId: expect.any(String),
			datos: {
				formato: "csv",
				totalRegistros: 2,
				filtros: {
					usuarioId: adminId,
					desde: "2026-11-10T00:00:00.000Z",
					hasta: "2026-11-11T23:59:59.999Z",
					orden: "id",
					direccion: "asc",
				},
			},
		});
	});
});
