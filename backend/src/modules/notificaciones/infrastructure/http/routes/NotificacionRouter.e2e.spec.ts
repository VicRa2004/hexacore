import { beforeAll, describe, expect, it } from "bun:test";
import { prisma } from "@/core/config/prisma";
import { api, crearUsuario, login, PASSWORD, vaciarUsuarios } from "@/test/e2e";

describe("Notificaciones dentro de la app (e2e)", () => {
	let adminId: number;
	let usuarioAId: number;
	let adminToken: string;
	let tokenA: string;
	let tokenB: string;

	beforeAll(async () => {
		await vaciarUsuarios();
		await prisma.notificacion.deleteMany();
		adminId = (await crearUsuario("admin-notif@e2e.dev", "ADMIN")).id;
		usuarioAId = (await crearUsuario("user-a@e2e.dev")).id;
		await crearUsuario("user-b@e2e.dev");
		adminToken = await login("admin-notif@e2e.dev");
		await login("user-a@e2e.dev", "Firefox");
		// Segundo navegador: genera la notificación de inicio de sesión en otro dispositivo.
		tokenA = await login("user-a@e2e.dev", "Chrome");
		tokenB = await login("user-b@e2e.dev");
	});

	it("sin token devuelve 401", async () => {
		expect((await api("/api/notificaciones")).status).toBe(401);
	});

	it("genera notificaciones por login, asignación de rol y cambio de contraseña", async () => {
		const rolAdmin = await prisma.rol.findUniqueOrThrow({
			where: { nombre: "ADMIN" },
		});

		const resAsignacion = await api(
			`/api/asignaciones/usuarios/${usuarioAId}`,
			{
				method: "PUT",
				token: adminToken,
				body: { rolIds: [rolAdmin.id], permisosDirectos: [] },
			},
		);
		expect(resAsignacion.status).toBe(200);

		const resPassword = await api("/api/auth/password", {
			method: "PUT",
			token: tokenA,
			body: {
				passwordActual: PASSWORD,
				passwordNueva: "NuevaPassword#2026",
			},
		});
		expect(resPassword.status).toBe(200);
		const { accessToken: nuevoTokenA } = await resPassword.json();
		tokenA = nuevoTokenA;

		const resLista = await api("/api/notificaciones", { token: tokenA });
		expect(resLista.status).toBe(200);
		const cuerpo = await resLista.json();
		const tipos = cuerpo.datos.map((n: { tipo: string }) => n.tipo);

		expect(tipos).toContain("auth.sesion_iniciada");
		expect(tipos).toContain("autorizacion.asignacion_actualizada");
		expect(tipos).toContain("auth.password_cambiada");
		expect(cuerpo.noLeidas).toBe(cuerpo.datos.length);

		const notifRol = cuerpo.datos.find(
			(n: { tipo: string }) => n.tipo === "autorizacion.asignacion_actualizada",
		);
		expect(notifRol.datos).toMatchObject({
			rolesAgregados: ["ADMIN"],
			rolesQuitados: [],
			permisosDirectosCambiados: false,
		});
	});

	it("notifica el inicio de sesión solo desde un dispositivo nuevo", async () => {
		const { id } = await crearUsuario("user-c@e2e.dev");
		const contarSesiones = () =>
			prisma.notificacion.count({
				where: { usuarioId: id, tipo: "auth.sesion_iniciada" },
			});

		await login("user-c@e2e.dev", "Firefox");
		expect(await contarSesiones()).toBe(0); // primer login

		await login("user-c@e2e.dev", "Firefox");
		expect(await contarSesiones()).toBe(0); // mismo navegador

		await login("user-c@e2e.dev", "Chrome");
		expect(await contarSesiones()).toBe(1); // navegador nuevo
		const notif = await prisma.notificacion.findFirstOrThrow({
			where: { usuarioId: id, tipo: "auth.sesion_iniciada" },
		});
		expect(notif.datos).toMatchObject({ dispositivo: "Chrome" });
	});

	it("aísla notificaciones entre usuarios y permite marcar una o todas como leídas", async () => {
		const listaA = await (
			await api("/api/notificaciones?soloNoLeidas=true", { token: tokenA })
		).json();
		expect(listaA.datos.length).toBeGreaterThanOrEqual(2);

		const primeraId = listaA.datos[0].id;

		// Usuario B no puede marcar ni ver como propia una notificación de usuario A
		const resAjena = await api(`/api/notificaciones/${primeraId}/leer`, {
			method: "PATCH",
			token: tokenB,
		});
		expect(resAjena.status).toBe(404);

		// Usuario A marca una como leída
		const resUna = await api(`/api/notificaciones/${primeraId}/leer`, {
			method: "PATCH",
			token: tokenA,
		});
		expect(resUna.status).toBe(200);
		const marcada = await resUna.json();
		expect(marcada.leida).toBe(true);
		expect(marcada.leidaEn).toEqual(expect.any(String));

		// Usuario A marca todas las restantes
		const resTodas = await api("/api/notificaciones/leer-todas", {
			method: "PATCH",
			token: tokenA,
		});
		expect(resTodas.status).toBe(200);
		const { actualizadas } = await resTodas.json();
		expect(actualizadas).toBeGreaterThanOrEqual(1);

		const trasTodas = await (
			await api("/api/notificaciones", { token: tokenA })
		).json();
		expect(trasTodas.noLeidas).toBe(0);
		expect(adminId).toBeGreaterThan(0);
	});
});
