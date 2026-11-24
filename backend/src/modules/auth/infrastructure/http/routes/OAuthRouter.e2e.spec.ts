import { beforeAll, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { env } from "@/core/config/env";
import { prisma } from "@/core/config/prisma";
import { api, crearUsuario, login, vaciarUsuarios } from "@/test/e2e";

const sha256 = (texto: string) =>
	createHash("sha256").update(texto).digest("hex");

/** Lo que haría la vuelta del proveedor: un código `oauth_login` de un solo uso. */
async function codigoOAuth(usuarioId: number, codigo: string) {
	await prisma.tokenCuenta.create({
		data: {
			usuarioId,
			tipo: "oauth_login",
			tokenHash: sha256(codigo),
			expiraEn: new Date(Date.now() + 60_000),
		},
	});
}

describe("OAuth (e2e)", () => {
	beforeAll(vaciarUsuarios);

	it("solo lista los proveedores con credenciales", async () => {
		const res = await api("/api/auth/oauth/proveedores");
		const esperados = [
			env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && "google",
			env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && "github",
		].filter(Boolean);
		expect(await res.json()).toEqual({ proveedores: esperados });
	});

	it("la vuelta sin cookie de estado redirige a la web con el error", async () => {
		const res = await api("/api/auth/oauth/google/callback?code=c&state=falso");
		expect(res.status).toBe(302);
		const destino = new URL(res.headers.get("Location") ?? "");
		expect(`${destino.origin}${destino.pathname}`).toBe(
			`${env.APP_URL}/oauth-callback`,
		);
		expect(
			new URLSearchParams(destino.hash.slice(1)).get("error"),
		).toBeTruthy();
	});

	it("canjear: el código da la sesión con cookie y es de un solo uso", async () => {
		const usuario = await crearUsuario("oauth@e2e.dev");
		await codigoOAuth(usuario.id, "codigo-e2e");
		const canjear = () =>
			api("/api/auth/oauth/canjear", {
				method: "POST",
				body: { codigo: "codigo-e2e" },
				ip: "10.0.9.1",
			});

		const res = await canjear();
		expect(res.status).toBe(200);
		expect((await res.json()).usuario.email).toBe("oauth@e2e.dev");
		expect(res.headers.getSetCookie().join()).toContain("refresh_token=");

		expect((await canjear()).status).toBe(400);
	});

	it("lista y desvincula las cuentas del usuario en sesión", async () => {
		const usuario = await crearUsuario("vinculos@e2e.dev");
		await prisma.cuentaOAuth.create({
			data: {
				usuarioId: usuario.id,
				proveedor: "github",
				idExterno: "42",
				email: "vinculos@e2e.dev",
			},
		});
		const token = await login("vinculos@e2e.dev");

		const cuentas = await api("/api/auth/oauth/cuentas", { token });
		expect(await cuentas.json()).toEqual([
			expect.objectContaining({
				proveedor: "github",
				email: "vinculos@e2e.dev",
			}),
		]);

		const desvincular = () =>
			api("/api/auth/oauth/cuentas/github", { method: "DELETE", token });
		expect((await desvincular()).status).toBe(200);
		expect((await desvincular()).status).toBe(404);
	});
});
