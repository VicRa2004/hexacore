import { beforeAll, describe, expect, it } from "bun:test";
import { prisma } from "@/core/config/prisma";
import { api, crearUsuario, login, PASSWORD, vaciarUsuarios } from "@/test/e2e";
import { generarCodigoTotp } from "../../../application/services/totp";

let ipLibre = 1;
const conIp = () => `10.0.5.${ipLibre++}`;
const PASO = 30_000;

const loginCon = (email: string) =>
	api("/api/auth/login", {
		method: "POST",
		body: { email, password: PASSWORD },
		ip: conIp(),
	});

const loginDosFactores = (token2fa: string, codigo: string) =>
	api("/api/auth/login/2fa", {
		method: "POST",
		body: { token2fa, codigo },
		ip: conIp(),
	});

/** Alta completa: devuelve el secreto y los códigos de recuperación. */
async function activar(token: string) {
	const alta = await api("/api/auth/2fa/alta", { method: "POST", token });
	expect(alta.status).toBe(200);
	const { secreto, otpauthUri } = await alta.json();
	expect(otpauthUri).toContain(`secret=${secreto}`);

	const res = await api("/api/auth/2fa/activar", {
		method: "POST",
		token,
		body: { codigo: generarCodigoTotp(secreto) },
	});
	expect(res.status).toBe(200);
	const { codigosRecuperacion } = await res.json();
	return { secreto, codigosRecuperacion: codigosRecuperacion as string[] };
}

describe("Verificación en dos pasos (e2e)", () => {
	beforeAll(vaciarUsuarios);

	it("alta → login en dos pasos → recuperación → desactivar, con auditoría", async () => {
		const inicio = new Date();
		const usuario = await crearUsuario("totp@e2e.dev");
		const token = await login("totp@e2e.dev");

		const pendiente = await api("/api/auth/2fa/activar", {
			method: "POST",
			token,
			body: { codigo: "123456" },
		});
		expect(pendiente.status).toBe(400);

		const { secreto, codigosRecuperacion } = await activar(token);
		expect(codigosRecuperacion).toHaveLength(10);

		// El secreto se guarda cifrado y los códigos solo como hash.
		const fila = await prisma.usuario.findUniqueOrThrow({
			where: { id: usuario.id },
		});
		expect(fila.totpSecreto).not.toContain(secreto);
		const hashes = await prisma.codigoRecuperacion.findMany({
			where: { usuarioId: usuario.id },
		});
		expect(hashes.map((h) => h.codigoHash)).not.toContain(
			codigosRecuperacion[0],
		);

		const estado = await api("/api/auth/2fa", { token });
		expect(await estado.json()).toEqual({ activo: true, codigosRestantes: 10 });

		// Paso 1: la contraseña ya no abre sesión.
		const paso1 = await loginCon("totp@e2e.dev");
		expect(paso1.status).toBe(200);
		const { token2fa, accessToken } = await paso1.json();
		expect(accessToken).toBeUndefined();
		expect(paso1.headers.getSetCookie()).toHaveLength(0);

		// El token intermedio no sirve como access token.
		expect((await api("/api/auth/2fa", { token: token2fa })).status).toBe(401);

		// El código de la activación ya se usó: el siguiente paso sí vale.
		expect((await loginDosFactores(token2fa, "000000")).status).toBe(401);
		const codigo = generarCodigoTotp(secreto, Date.now() + PASO);
		const paso2 = await loginDosFactores(token2fa, codigo);
		expect(paso2.status).toBe(200);
		expect((await paso2.json()).accessToken).toBeString();
		// Reutilizar el mismo código (replay) falla.
		expect((await loginDosFactores(token2fa, codigo)).status).toBe(401);

		// Código de recuperación: un solo uso.
		const recuperacion = codigosRecuperacion[0] as string;
		const { token2fa: otro } = await (await loginCon("totp@e2e.dev")).json();
		expect((await loginDosFactores(otro, recuperacion)).status).toBe(200);
		expect((await loginDosFactores(otro, recuperacion)).status).toBe(401);

		// Desactivar pide contraseña y código.
		const sinPassword = await api("/api/auth/2fa/desactivar", {
			method: "POST",
			token,
			body: { password: "mala", codigo: codigosRecuperacion[1] },
		});
		expect(sinPassword.status).toBe(400);
		const desactivar = await api("/api/auth/2fa/desactivar", {
			method: "POST",
			token,
			body: { password: PASSWORD, codigo: codigosRecuperacion[1] },
		});
		expect(desactivar.status).toBe(200);
		expect(
			(await (await loginCon("totp@e2e.dev")).json()).accessToken,
		).toBeString();

		const eventos = await prisma.auditoria.findMany({
			where: {
				evento: { startsWith: "auth.2fa_" },
				ocurridoEn: { gte: inicio },
			},
			orderBy: { id: "asc" },
		});
		expect(eventos.map((e) => [e.evento, e.usuarioId])).toEqual([
			["auth.2fa_activado", usuario.id],
			["auth.2fa_desactivado", usuario.id],
		]);
	});

	it("bloquea la cuenta tras 5 códigos incorrectos aunque se repita la contraseña", async () => {
		await crearUsuario("bloqueo-totp@e2e.dev");
		await activar(await login("bloqueo-totp@e2e.dev"));

		for (let i = 0; i < 5; i++) {
			const { token2fa } = await (
				await loginCon("bloqueo-totp@e2e.dev")
			).json();
			expect((await loginDosFactores(token2fa, "ZZZZZ-ZZZZZ")).status).toBe(
				401,
			);
		}

		// Bloqueada: ni la contraseña entra hasta que pase el bloqueo.
		expect((await loginCon("bloqueo-totp@e2e.dev")).status).toBe(429);
	});

	it("regenerar los códigos de recuperación invalida los anteriores", async () => {
		await crearUsuario("codigos@e2e.dev");
		const token = await login("codigos@e2e.dev");
		const { codigosRecuperacion: viejos } = await activar(token);

		const regenerar = (codigo: string) =>
			api("/api/auth/2fa/codigos-recuperacion", {
				method: "POST",
				token,
				body: { codigo },
			});
		expect((await regenerar("ZZZZZ-ZZZZZ")).status).toBe(400);
		const res = await regenerar(viejos[0] as string);
		expect(res.status).toBe(200);
		const { codigosRecuperacion: nuevos } = await res.json();
		expect(nuevos).toHaveLength(10);

		expect((await regenerar(viejos[1] as string)).status).toBe(400);
		expect((await regenerar(nuevos[0])).status).toBe(200);
	});
});
