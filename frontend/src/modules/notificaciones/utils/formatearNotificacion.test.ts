import { describe, expect, it } from "vitest";
import {
	formatearNotificacion,
	formatearTiempoRelativo,
} from "./formatearNotificacion";

describe("formatearNotificacion", () => {
	it("formatea asignación de un único rol", () => {
		expect(
			formatearNotificacion({
				tipo: "autorizacion.asignacion_actualizada",
				datos: {
					rolesAgregados: ["ADMIN"],
					rolesQuitados: [],
					permisosDirectosCambiados: false,
				},
			}),
		).toEqual({
			titulo: "Te asignaron el rol ADMIN",
			descripcion: "Tus permisos de acceso se actualizaron.",
		});
	});

	it("formatea cambios múltiples en asignación, contraseña y sesión", () => {
		expect(
			formatearNotificacion({
				tipo: "autorizacion.asignacion_actualizada",
				datos: {
					rolesAgregados: ["MOD"],
					rolesQuitados: ["USUARIO"],
					permisosDirectosCambiados: true,
				},
			}).descripcion,
		).toContain("Roles asignados: MOD");

		expect(
			formatearNotificacion({
				tipo: "auth.password_cambiada",
				datos: { metodo: "cambio" },
			}).titulo,
		).toBe("Se cambió tu contraseña");

		expect(
			formatearNotificacion({
				tipo: "auth.sesion_iniciada",
				datos: { metodo: "password", dispositivo: "Firefox" },
			}),
		).toEqual({
			titulo: "Nuevo inicio de sesión",
			descripcion: "Acceso con contraseña desde Firefox",
		});
	});

	it("formatea 2FA, actualización de cuenta y tipo desconocido", () => {
		expect(
			formatearNotificacion({ tipo: "auth.2fa_activado", datos: {} }).titulo,
		).toBe("Verificación en dos pasos activada");
		expect(
			formatearNotificacion({ tipo: "auth.2fa_desactivado", datos: {} }).titulo,
		).toBe("Verificación en dos pasos desactivada");
		expect(
			formatearNotificacion({
				tipo: "usuario.actualizado",
				datos: { campos: ["nombre"] },
			}).descripcion,
		).toContain("nombre");
		expect(
			formatearNotificacion({ tipo: "evento.otro", datos: {} }).titulo,
		).toBe("Nueva notificación");
	});
});

describe("formatearTiempoRelativo", () => {
	const ahora = new Date("2026-11-26T12:00:00.000Z");

	it("formatea segundos, minutos, horas y días", () => {
		expect(formatearTiempoRelativo("2026-11-26T11:59:30.000Z", ahora)).toBe(
			"Ahora",
		);
		expect(formatearTiempoRelativo("2026-11-26T11:50:00.000Z", ahora)).toBe(
			"Hace 10 min",
		);
		expect(formatearTiempoRelativo("2026-11-26T09:00:00.000Z", ahora)).toBe(
			"Hace 3 h",
		);
		expect(formatearTiempoRelativo("2026-11-24T12:00:00.000Z", ahora)).toBe(
			"Hace 2 d",
		);
	});
});
