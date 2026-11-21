import { describe, expect, it } from "vitest";
import { describirDispositivo } from "./dispositivo";

describe("describirDispositivo", () => {
	it.each([
		[
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 Edg/131.0",
			"Edge en Windows",
			false,
		],
		[
			"Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
			"Firefox en Linux",
			false,
		],
		[
			"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
			"Safari en iPhone",
			true,
		],
		[
			"Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36",
			"Chrome en Android",
			true,
		],
	])("%s → %s", (ua, nombre, movil) => {
		expect(describirDispositivo(ua)).toEqual({ nombre, movil });
	});

	it("sin user agent o irreconocible", () => {
		expect(describirDispositivo(null).nombre).toBe("Dispositivo desconocido");
		expect(describirDispositivo("curl/8.0").nombre).toBe(
			"Dispositivo desconocido",
		);
	});
});
