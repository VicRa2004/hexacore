import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { env } from "@/core/config/env";

const COOKIE_NAME = "refresh_token";

// Sólo viaja a las rutas de auth y nunca es legible desde JavaScript (XSS).
const cookieOptions = {
	httpOnly: true,
	secure: env.NODE_ENV === "prod",
	sameSite: "Strict",
	path: "/api/auth",
} as const;

/** Guarda el refresh token en una cookie httpOnly (misma vida que en BD: 7 días). */
export function setRefreshTokenCookie(c: Context, refreshToken: string): void {
	setCookie(c, COOKIE_NAME, refreshToken, {
		...cookieOptions,
		maxAge: 60 * 60 * 24 * 7,
	});
}

export function getRefreshTokenCookie(c: Context): string | undefined {
	return getCookie(c, COOKIE_NAME);
}

export function clearRefreshTokenCookie(c: Context): void {
	deleteCookie(c, COOKIE_NAME, cookieOptions);
}
