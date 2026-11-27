import type { NotificacionItem } from "../api/notificacionesApi";

export interface NotificacionFormateada {
	titulo: string;
	descripcion: string;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
	return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function leerStrings(valor: unknown): string[] {
	if (!Array.isArray(valor)) return [];
	return valor.filter((item): item is string => typeof item === "string");
}

function formatearAsignacion(
	datos: Record<string, unknown>,
): NotificacionFormateada {
	const agregados = leerStrings(datos.rolesAgregados);
	const quitados = leerStrings(datos.rolesQuitados);
	const permisosCambiados = datos.permisosDirectosCambiados === true;

	if (agregados.length === 1 && quitados.length === 0 && !permisosCambiados) {
		return {
			titulo: `Te asignaron el rol ${agregados[0]}`,
			descripcion: "Tus permisos de acceso se actualizaron.",
		};
	}

	const partes: string[] = [];
	if (agregados.length > 0) {
		partes.push(`Roles asignados: ${agregados.join(", ")}`);
	}
	if (quitados.length > 0) {
		partes.push(`Roles retirados: ${quitados.join(", ")}`);
	}
	if (permisosCambiados) {
		partes.push("Se actualizaron tus permisos directos");
	}

	return {
		titulo: "Se actualizaron tus permisos",
		descripcion:
			partes.length > 0
				? partes.join(" · ")
				: "Un administrador modificó tu asignación.",
	};
}

function formatearSesionIniciada(
	datos: Record<string, unknown>,
): NotificacionFormateada {
	const dispositivo =
		typeof datos.dispositivo === "string" && datos.dispositivo.trim().length > 0
			? datos.dispositivo.trim()
			: null;
	const metodo =
		datos.metodo === "2fa"
			? "con verificación en dos pasos"
			: datos.metodo === "oauth"
				? "con acceso social"
				: "con contraseña";

	return {
		titulo: "Nuevo inicio de sesión",
		descripcion: dispositivo
			? `Acceso ${metodo} desde ${dispositivo}`
			: `Se inició sesión en tu cuenta ${metodo}.`,
	};
}

export function formatearNotificacion(
	notificacion: Pick<NotificacionItem, "tipo" | "datos">,
): NotificacionFormateada {
	const datos = esObjeto(notificacion.datos) ? notificacion.datos : {};

	switch (notificacion.tipo) {
		case "autorizacion.asignacion_actualizada":
			return formatearAsignacion(datos);

		case "auth.password_cambiada":
			return {
				titulo: "Se cambió tu contraseña",
				descripcion:
					datos.metodo === "restablecimiento"
						? "Tu contraseña se restableció y se cerraron las sesiones anteriores."
						: "Tu contraseña se actualizó y se cerraron las otras sesiones.",
			};

		case "auth.sesion_iniciada":
			return formatearSesionIniciada(datos);

		case "auth.2fa_activado":
			return {
				titulo: "Verificación en dos pasos activada",
				descripcion: "Tu cuenta ahora está protegida con 2FA.",
			};

		case "auth.2fa_desactivado":
			return {
				titulo: "Verificación en dos pasos desactivada",
				descripcion: "Se desactivó el segundo factor en tu cuenta.",
			};

		case "usuario.actualizado": {
			const campos = leerStrings(datos.campos);
			return {
				titulo: "Tu cuenta fue actualizada",
				descripcion:
					campos.length > 0
						? `Campos modificados: ${campos.join(", ")}`
						: "Un administrador actualizó los datos de tu cuenta.",
			};
		}

		default:
			return {
				titulo: "Nueva notificación",
				descripcion: notificacion.tipo,
			};
	}
}

export function formatearTiempoRelativo(
	iso: string,
	ahora = new Date(),
): string {
	const fecha = new Date(iso);
	if (Number.isNaN(fecha.getTime())) return "";

	const segundos = Math.max(
		0,
		Math.floor((ahora.getTime() - fecha.getTime()) / 1000),
	);
	if (segundos < 60) return "Ahora";

	const minutos = Math.floor(segundos / 60);
	if (minutos < 60) return `Hace ${minutos} min`;

	const horas = Math.floor(minutos / 60);
	if (horas < 24) return `Hace ${horas} h`;

	const dias = Math.floor(horas / 24);
	if (dias < 7) return `Hace ${dias} d`;

	return fecha.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "short",
	});
}
