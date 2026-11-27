import { z } from "zod";
import type { ValoresAjustes } from "@/core/shared/domain/AjustesSistema";

export const REMITENTE_REGEX = /^([^<>\r\n]+<\S+@\S+>|\S+@\S+)$/;

export const nombreAppSchema = z
	.string()
	.trim()
	.min(1, "El nombre de la aplicación es obligatorio")
	.max(100, "El nombre no puede superar 100 caracteres");

export const colorMarcaSchema = z
	.number({ error: "El color de marca debe ser un número" })
	.int("El color de marca debe ser un entero")
	.min(0, "El tono debe estar entre 0 y 360")
	.max(360, "El tono debe estar entre 0 y 360");

export const remitenteCorreoSchema = z
	.string()
	.trim()
	.min(3, "El remitente es obligatorio")
	.max(200, "El remitente no puede superar 200 caracteres")
	.regex(
		REMITENTE_REGEX,
		"Usa un correo válido o formato «Nombre <correo@dominio.com>»",
	);

export const registroPublicoAbiertoSchema = z.boolean();

export const claveImagenSchema = z.string().min(1).max(255).nullable();

/** Esquemas Zod por cada clave almacenada en la tabla `ajuste`. */
export const ESQUEMAS_AJUSTES = {
	nombreApp: nombreAppSchema,
	colorMarca: colorMarcaSchema,
	remitenteCorreo: remitenteCorreoSchema,
	registroPublicoAbierto: registroPublicoAbiertoSchema,
	logoClave: claveImagenSchema,
	faviconClave: claveImagenSchema,
} as const;

export type ClaveAjuste = keyof ValoresAjustes;

/** Esquema de validación para actualizaciones parciales desde la API. */
export const ajustesActualizacionSchema = z
	.object({
		nombreApp: nombreAppSchema.optional(),
		colorMarca: colorMarcaSchema.optional(),
		remitenteCorreo: remitenteCorreoSchema.optional(),
		registroPublicoAbierto: registroPublicoAbiertoSchema.optional(),
	})
	.refine((datos) => Object.values(datos).some((v) => v !== undefined), {
		message: "Debes indicar al menos un ajuste para actualizar",
	});

export function crearValoresPorDefecto(
	remitenteCorreo: string,
): ValoresAjustes {
	return {
		nombreApp: "Hexacore",
		colorMarca: 277,
		remitenteCorreo,
		registroPublicoAbierto: true,
		logoClave: null,
		faviconClave: null,
	};
}

function leerClave<K extends ClaveAjuste>(
	filas: Map<string, unknown>,
	clave: K,
	fallback: ValoresAjustes[K],
): ValoresAjustes[K] {
	if (!filas.has(clave)) return fallback;
	const resultado = ESQUEMAS_AJUSTES[clave].safeParse(filas.get(clave));
	return resultado.success ? (resultado.data as ValoresAjustes[K]) : fallback;
}

/** Resuelve y valida cada clave con su esquema Zod, aplicando fallback seguro si falta o es inválida. */
export function resolverValoresAjustes(
	filas: Map<string, unknown>,
	defaults: ValoresAjustes,
): ValoresAjustes {
	return {
		nombreApp: leerClave(filas, "nombreApp", defaults.nombreApp),
		colorMarca: leerClave(filas, "colorMarca", defaults.colorMarca),
		remitenteCorreo: leerClave(
			filas,
			"remitenteCorreo",
			defaults.remitenteCorreo,
		),
		registroPublicoAbierto: leerClave(
			filas,
			"registroPublicoAbierto",
			defaults.registroPublicoAbierto,
		),
		logoClave: leerClave(filas, "logoClave", defaults.logoClave),
		faviconClave: leerClave(filas, "faviconClave", defaults.faviconClave),
	};
}
