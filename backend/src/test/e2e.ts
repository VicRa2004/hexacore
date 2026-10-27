import bcrypt from "bcrypt";
import { prisma } from "@/core/config/prisma";
import { app } from "@/core/shared/infrastructure/http/server";

/** Helpers de los `*.e2e.spec.ts`: app real (contenedor DI + Prisma) contra la BD de test. */

export const PASSWORD = "SecurePass123!";

/**
 * Vacía los usuarios y, en cascada, sus roles, permisos directos y refresh tokens.
 * Conserva el catálogo de roles y permisos que carga el seed.
 */
export async function vaciarUsuarios(): Promise<void> {
	await prisma.$executeRawUnsafe('TRUNCATE "usuario" RESTART IDENTITY CASCADE');
}

/** Crea un usuario directamente en BD, con el rol indicado o sin ninguno. */
export async function crearUsuario(email: string, rol?: string) {
	return prisma.usuario.create({
		data: {
			email,
			nombre: "Usuario E2E",
			password: await bcrypt.hash(PASSWORD, 4),
			roles: rol ? { create: { rol: { connect: { nombre: rol } } } } : {},
		},
	});
}

export async function api(
	path: string,
	init: {
		method?: string;
		body?: unknown;
		token?: string;
		cookie?: string;
	} = {},
): Promise<Response> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (init.token) headers.Authorization = `Bearer ${init.token}`;
	if (init.cookie) headers.Cookie = init.cookie;

	return app.request(path, {
		method: init.method ?? "GET",
		headers,
		body: init.body === undefined ? undefined : JSON.stringify(init.body),
	});
}

/** `refresh_token=...` del Set-Cookie, listo para reenviarlo en `cookie`. */
export function refreshCookie(res: Response): string {
	const cookie = res.headers
		.getSetCookie()
		.find((c) => c.startsWith("refresh_token="));
	if (!cookie) throw new Error("La respuesta no trae la cookie refresh_token");
	return cookie.split(";")[0] as string;
}

// shortcut: el rate limit de /login (5 cada 15 min por IP) es en memoria y compartido
// por todos los e2e del proceso; si se superan, darles una IP distinta por petición.
export async function login(email: string): Promise<string> {
	const res = await api("/api/auth/login", {
		method: "POST",
		body: { email, password: PASSWORD },
	});
	if (res.status !== 200) throw new Error(`Login fallido: ${res.status}`);
	return ((await res.json()) as { accessToken: string }).accessToken;
}
