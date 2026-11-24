import { createHash, randomBytes } from "node:crypto";
import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { env } from "@/core/config/env";
import type { NombreProveedorOAuth } from "../../domain/service/ProveedorOAuth";

const NOMBRE_COOKIE = "oauth_estado";

// Lax (no Strict): tiene que llegar en la navegación de vuelta desde el proveedor.
const opcionesCookie = {
	httpOnly: true,
	secure: env.NODE_ENV === "prod",
	sameSite: "Lax",
	path: "/api/auth/oauth",
} as const;

/** Lo que hay que recordar entre la ida al proveedor y la vuelta (10 min). */
export interface EstadoOAuth {
	state: string;
	codeVerifier: string;
	proveedor: NombreProveedorOAuth;
	/** Solo en modo vincular: el usuario con sesión que inició el flujo. */
	usuarioId?: number;
}

/** `state` anti-CSRF y verificador PKCE nuevos; devuelve el `code_challenge` (S256). */
export function nuevoEstadoOAuth(
	proveedor: NombreProveedorOAuth,
	usuarioId?: number,
): { estado: EstadoOAuth; codeChallenge: string } {
	const codeVerifier = randomBytes(32).toString("base64url");
	return {
		estado: {
			state: randomBytes(16).toString("base64url"),
			codeVerifier,
			proveedor,
			usuarioId,
		},
		codeChallenge: createHash("sha256")
			.update(codeVerifier)
			.digest("base64url"),
	};
}

/** Firmada con JWT_SECRET: el `usuarioId` del modo vincular no se puede falsificar. */
export async function guardarEstadoOAuth(
	c: Context,
	estado: EstadoOAuth,
): Promise<void> {
	await setSignedCookie(
		c,
		NOMBRE_COOKIE,
		JSON.stringify(estado),
		env.JWT_SECRET,
		{ ...opcionesCookie, maxAge: 10 * 60 },
	);
}

/** Lee y borra la cookie (un solo uso). `null` si falta, caducó o la firma no cuadra. */
export async function consumirEstadoOAuth(
	c: Context,
): Promise<EstadoOAuth | null> {
	const valor = await getSignedCookie(c, env.JWT_SECRET, NOMBRE_COOKIE);
	deleteCookie(c, NOMBRE_COOKIE, opcionesCookie);
	return valor ? (JSON.parse(valor) as EstadoOAuth) : null;
}
