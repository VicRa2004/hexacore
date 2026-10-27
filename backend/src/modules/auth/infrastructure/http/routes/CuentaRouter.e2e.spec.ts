import { beforeAll, beforeEach, describe, expect, it, spyOn } from "bun:test";
import type { Correo } from "@/core/shared/domain/Mailer";
import { container } from "@/core/shared/infrastructure/di/container";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import {
	api,
	crearUsuario,
	login,
	PASSWORD,
	refreshCookie,
	vaciarUsuarios,
} from "@/test/e2e";

const NUEVA = "OtraPassword456!";
const correos: Correo[] = [];
spyOn(container.get(TOKENS.Mailer), "enviar").mockImplementation(
	async (correo) => {
		correos.push(correo);
	},
);

/** Token del último correo enviado a `para`. */
function tokenEnviadoA(para: string): string {
	const correo = correos.findLast((c) => c.para === para);
	const token = correo?.texto.match(/token=([a-f0-9]+)/)?.[1];
	if (!token) throw new Error(`No se envió ningún enlace a ${para}`);
	return token;
}

let ipLibre = 100;
const loginCon = (email: string, password: string) =>
	api("/api/auth/login", {
		method: "POST",
		body: { email, password },
		ip: `10.0.1.${ipLibre++}`,
	});

const refresh = (cookie: string) =>
	api("/api/auth/refresh", { method: "POST", cookie });

describe("Cuenta (e2e)", () => {
	beforeAll(vaciarUsuarios);
	beforeEach(() => {
		correos.length = 0;
	});

	it("registro → enlace de verificación → email verificado (un solo uso)", async () => {
		const registro = await api("/api/auth/registro", {
			method: "POST",
			body: { nombre: "Vera", email: "vera@e2e.dev", password: PASSWORD },
			ip: "10.0.2.1",
		});
		expect(registro.status).toBe(201);
		expect((await registro.json()).usuario.emailVerificado).toBe(false);

		const token = tokenEnviadoA("vera@e2e.dev");
		const verificar = () =>
			api("/api/auth/verificar-email", { method: "POST", body: { token } });

		expect((await verificar()).status).toBe(200);
		expect((await verificar()).status).toBe(400);

		const sesion = await loginCon("vera@e2e.dev", PASSWORD);
		expect((await sesion.json()).usuario.emailVerificado).toBe(true);
	});

	it("recuperar → restablecer: cambia la contraseña y cierra las sesiones", async () => {
		await crearUsuario("rita@e2e.dev");
		const cookieVieja = refreshCookie(await loginCon("rita@e2e.dev", PASSWORD));

		const desconocido = await api("/api/auth/recuperar-password", {
			method: "POST",
			body: { email: "nadie@e2e.dev" },
		});
		expect(desconocido.status).toBe(200);
		expect(correos).toHaveLength(0);

		await api("/api/auth/recuperar-password", {
			method: "POST",
			body: { email: "rita@e2e.dev" },
		});
		const token = tokenEnviadoA("rita@e2e.dev");

		const restablecer = () =>
			api("/api/auth/restablecer-password", {
				method: "POST",
				body: { token, password: NUEVA },
			});
		expect((await restablecer()).status).toBe(200);
		expect((await restablecer()).status).toBe(400);

		expect((await refresh(cookieVieja)).status).toBe(401);
		expect((await loginCon("rita@e2e.dev", PASSWORD)).status).toBe(401);
		expect((await loginCon("rita@e2e.dev", NUEVA)).status).toBe(200);
	});

	it("cambiar la contraseña exige la actual y renueva la sesión", async () => {
		await crearUsuario("cris@e2e.dev");
		const token = await login("cris@e2e.dev");

		const incorrecta = await api("/api/auth/password", {
			method: "PUT",
			token,
			body: { passwordActual: "mala", passwordNueva: NUEVA },
		});
		expect(incorrecta.status).toBe(400);

		const cambio = await api("/api/auth/password", {
			method: "PUT",
			token,
			body: { passwordActual: PASSWORD, passwordNueva: NUEVA },
		});
		expect(cambio.status).toBe(200);
		expect((await cambio.json()).accessToken).toBeString();
		expect((await refresh(refreshCookie(cambio))).status).toBe(200);
		expect((await loginCon("cris@e2e.dev", NUEVA)).status).toBe(200);
	});

	it("logout-todas revoca las sesiones de todos los dispositivos", async () => {
		await crearUsuario("lola@e2e.dev");
		const movil = await loginCon("lola@e2e.dev", PASSWORD);
		const portatil = await loginCon("lola@e2e.dev", PASSWORD);
		const { accessToken } = await portatil.json();

		const res = await api("/api/auth/logout-todas", {
			method: "POST",
			token: accessToken,
		});
		expect(res.status).toBe(200);
		expect((await refresh(refreshCookie(movil))).status).toBe(401);
		expect((await refresh(refreshCookie(portatil))).status).toBe(401);
	});

	it("bloquea la cuenta tras 5 fallos aunque vengan de IPs distintas", async () => {
		await crearUsuario("bruno@e2e.dev");

		for (let i = 0; i < 5; i++) {
			expect((await loginCon("bruno@e2e.dev", "incorrecta")).status).toBe(401);
		}
		expect((await loginCon("bruno@e2e.dev", PASSWORD)).status).toBe(429);
	});
});
