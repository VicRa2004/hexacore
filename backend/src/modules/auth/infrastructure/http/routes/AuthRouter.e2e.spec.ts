import { beforeAll, describe, expect, it } from "bun:test";
import { api, PASSWORD, refreshCookie, vaciarUsuarios } from "@/test/e2e";

const refresh = (cookie: string) =>
	api("/api/auth/refresh", { method: "POST", cookie });

describe("Auth (e2e)", () => {
	beforeAll(vaciarUsuarios);

	it("registro → logout: el refresh token queda revocado", async () => {
		const body = { nombre: "Ana", email: "ana@e2e.dev", password: PASSWORD };

		const registro = await api("/api/auth/registro", { method: "POST", body });
		expect(registro.status).toBe(201);
		expect((await registro.json()).usuario.email).toBe("ana@e2e.dev");

		const duplicado = await api("/api/auth/registro", {
			method: "POST",
			body,
		});
		expect(duplicado.status).toBe(400);

		const cookie = refreshCookie(registro);
		const logout = await api("/api/auth/logout", { method: "POST", cookie });
		expect(logout.status).toBe(200);
		expect((await refresh(cookie)).status).toBe(401);
	});

	it("login → refresh rota el token y reutilizar el viejo revoca la sesión", async () => {
		const login = await api("/api/auth/login", {
			method: "POST",
			body: { email: "ana@e2e.dev", password: PASSWORD },
		});
		expect(login.status).toBe(200);
		const cookieVieja = refreshCookie(login);

		const rotado = await refresh(cookieVieja);
		expect(rotado.status).toBe(200);
		expect((await rotado.json()).accessToken).toBeString();
		const cookieNueva = refreshCookie(rotado);

		expect((await refresh(cookieVieja)).status).toBe(401);
		expect((await refresh(cookieNueva)).status).toBe(401);
	});

	it("login con contraseña incorrecta → 401", async () => {
		const res = await api("/api/auth/login", {
			method: "POST",
			body: { email: "ana@e2e.dev", password: "incorrecta" },
		});

		expect(res.status).toBe(401);
	});
});
