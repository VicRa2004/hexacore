import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { env } from "@/core/config/env";

const NOMBRE_COOKIE = "refresh_token";

// Sólo viaja a las rutas de auth y nunca es legible desde JavaScript (XSS).
const opcionesCookie = {
	httpOnly: true,
	secure: env.NODE_ENV === "prod",
	sameSite: "Strict",
	path: "/api/auth",
} as const;

/** Guarda el refresh token en una cookie httpOnly (misma vida que en BD: 7 días). */
export function setRefreshTokenCookie(c: Context, refreshToken: string): void {
	setCookie(c, NOMBRE_COOKIE, refreshToken, {
		...opcionesCookie,
		maxAge: 60 * 60 * 24 * 7,
	});
}

export function getRefreshTokenCookie(c: Context): string | undefined {
	return getCookie(c, NOMBRE_COOKIE);
}

export function clearRefreshTokenCookie(c: Context): void {
	deleteCookie(c, NOMBRE_COOKIE, opcionesCookie);
}
