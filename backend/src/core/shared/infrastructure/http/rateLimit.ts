import type { Context, MiddlewareHandler } from "hono";
import { getConnInfo } from "hono/bun";

interface RateLimitOptions {
	/** Ventana de tiempo en milisegundos. */
	windowMs: number;
	/** Peticiones permitidas por IP dentro de la ventana. */
	limit: number;
}

function clientIp(c: Context): string {
	// Detrás de Traefik (Dokploy) la IP real es la última de X-Forwarded-For:
	// la añade el proxy y el cliente no puede falsearla.
	if (process.env.TRUST_PROXY === "true") {
		const forwarded = c.req
			.header("x-forwarded-for")
			?.split(",")
			.at(-1)
			?.trim();
		if (forwarded) return forwarded;
	}
	try {
		return getConnInfo(c).remote.address ?? "unknown";
	} catch {
		// Sin servidor Bun (p.ej. `app.request` en tests) no hay info de conexión.
		return "unknown";
	}
}

/**
 * Limita las peticiones por IP con una ventana fija.
 *
 * Con `TRUST_PROXY=true` usa la IP que reporta el proxy; sin ella, la directa.
 *
 * shortcut: contador en memoria por proceso; con varias réplicas, pasar a
 * Redis (ver docs/escalado.md).
 */
export function rateLimit({
	windowMs,
	limit,
}: RateLimitOptions): MiddlewareHandler {
	const hits = new Map<string, { count: number; resetAt: number }>();

	return async (c, next) => {
		const now = Date.now();
		const ip = clientIp(c);

		let entry = hits.get(ip);
		if (!entry || entry.resetAt <= now) {
			// Purga las ventanas caducadas para que el mapa no crezca sin límite.
			for (const [key, value] of hits) {
				if (value.resetAt <= now) hits.delete(key);
			}
			entry = { count: 0, resetAt: now + windowMs };
			hits.set(ip, entry);
		}

		entry.count++;

		if (entry.count > limit) {
			c.header("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
			return c.json(
				{ error: "Demasiadas peticiones, inténtalo más tarde" },
				429,
			);
		}

		await next();
	};
}
