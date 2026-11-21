import { describe, expect, it, vi } from "vitest";
import {
	conSpan,
	iniciarTelemetria,
	inyectarCabecerasTraza,
	telemetriaActiva,
} from "./telemetria";

describe("telemetría frontend desactivada por defecto", () => {
	it("permanece inactiva sin VITE_OTEL_ENABLED y ejecuta conSpan en modo no-op", async () => {
		iniciarTelemetria();
		expect(telemetriaActiva()).toBe(false);

		const resultado = await conSpan("ui.prueba", async () => "ok", {
			recurso: "usuarios",
		});
		expect(resultado).toBe("ok");
	});

	it("no inyecta cabeceras de traza cuando está desactivada", () => {
		const asignar = vi.fn();
		inyectarCabecerasTraza(asignar);
		expect(asignar).not.toHaveBeenCalled();
	});

	it("propaga errores lanzados dentro de conSpan", async () => {
		await expect(
			conSpan("ui.error", async () => {
				throw new Error("fallo ui");
			}),
		).rejects.toThrow("fallo ui");
	});
});
