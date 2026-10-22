import { beforeAll, describe, expect, it } from "bun:test";
import { api, PASSWORD, refreshCookie, resetUsers } from "@/test/e2e";

const refresh = (cookie: string) =>
	api("/api/auth/refresh", { method: "POST", cookie });

describe("Auth (e2e)", () => {
	beforeAll(resetUsers);

	it("registro → logout: el refresh token queda revocado", async () => {
		const body = { name: "Ana", email: "ana@e2e.dev", password: PASSWORD };

		const register = await api("/api/auth/register", { method: "POST", body });
		expect(register.status).toBe(201);
		expect((await register.json()).user.email).toBe("ana@e2e.dev");

		const duplicated = await api("/api/auth/register", {
			method: "POST",
			body,
		});
		expect(duplicated.status).toBe(400);

		const cookie = refreshCookie(register);
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
		const oldCookie = refreshCookie(login);

		const rotated = await refresh(oldCookie);
		expect(rotated.status).toBe(200);
		expect((await rotated.json()).accessToken).toBeString();
		const newCookie = refreshCookie(rotated);

		expect((await refresh(oldCookie)).status).toBe(401);
		expect((await refresh(newCookie)).status).toBe(401);
	});

	it("login con contraseña incorrecta → 401", async () => {
		const res = await api("/api/auth/login", {
			method: "POST",
			body: { email: "ana@e2e.dev", password: "incorrecta" },
		});

		expect(res.status).toBe(401);
	});
});
