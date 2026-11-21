import { describe, expect, it } from "bun:test";
import type { ErrorEvent } from "@sentry/bun";
import { limpiarEvento, urlIngesta } from "./monitoreo";

describe("limpiarEvento", () => {
	it("debería quitar cuerpo, cookies, cabeceras, query y datos del usuario salvo el id", () => {
		const evento = limpiarEvento({
			type: undefined,
			request: {
				method: "POST",
				url: "https://app.dev/api/usuarios?q=secreto",
				data: { contenido: "dato privado" },
				cookies: { refresh: "x" },
				headers: { authorization: "Bearer x" },
			},
			user: { id: "7", email: "ana@x.dev", ip_address: "1.2.3.4" },
			breadcrumbs: [{ message: "correo enviado a ana@x.dev" }],
		} as ErrorEvent);

		expect(evento.request).toEqual({
			method: "POST",
			url: "https://app.dev/api/usuarios",
		});
		expect(evento.user).toEqual({ id: "7" });
		expect(evento.breadcrumbs).toBeUndefined();
	});
});

describe("urlIngesta", () => {
	const dsn = "https://clave@glitchtip.dev/7";
	const sobre = (d: string) =>
		`${JSON.stringify({ dsn: d })}\n{"type":"event"}\n{}`;

	it("debería devolver el endpoint de ingesta cuando el sobre va a nuestro DSN", () => {
		expect(urlIngesta(sobre(dsn), dsn)).toBe(
			"https://glitchtip.dev/api/7/envelope/?sentry_key=clave",
		);
		expect(urlIngesta(new TextEncoder().encode(sobre(dsn)), dsn)).toBe(
			"https://glitchtip.dev/api/7/envelope/?sentry_key=clave",
		);
		const dsnSubruta = "https://clave@glitchtip.dev/sentry/7";
		expect(urlIngesta(sobre(dsnSubruta), dsnSubruta)).toBe(
			"https://glitchtip.dev/sentry/api/7/envelope/?sentry_key=clave",
		);
	});

	it("debería rechazar otro host, protocolo, clave, proyecto, sobre inválido o DSN incompleto", () => {
		expect(urlIngesta(sobre("https://clave@evil.dev/7"), dsn)).toBeUndefined();
		expect(
			urlIngesta(sobre("http://clave@glitchtip.dev/7"), dsn),
		).toBeUndefined();
		expect(
			urlIngesta(sobre("https://otra@glitchtip.dev/7"), dsn),
		).toBeUndefined();
		expect(
			urlIngesta(sobre("https://clave@glitchtip.dev/8"), dsn),
		).toBeUndefined();
		expect(
			urlIngesta(sobre("https://glitchtip.dev/7"), "https://glitchtip.dev/7"),
		).toBeUndefined();
		expect(
			urlIngesta(
				sobre("https://clave@glitchtip.dev/sin-id"),
				"https://clave@glitchtip.dev/sin-id",
			),
		).toBeUndefined();
		expect(urlIngesta("no es json", dsn)).toBeUndefined();
		expect(urlIngesta(sobre(dsn), undefined)).toBeUndefined();
	});
});
