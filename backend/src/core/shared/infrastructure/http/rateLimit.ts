import type { Context, MiddlewareHandler } from "hono";
import { getConnInfo } from "hono/bun";

interface RateLimitOptions {
	/** Ventana de tiempo en milisegundos. */
	windowMs: number;
	/** Peticiones permitidas por IP dentro de la ventana. */
	limit: number;
}

function clientIp(c: Context): string {
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
 * shortcut: contador en memoria por proceso y por IP directa; con varias
 * réplicas o detrás de un proxy, pasar a Redis y leer la IP del proxy.
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
			return c.json({ error: "Too many requests, try again later" }, 429);
		}

		await next();
	};
}
