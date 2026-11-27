import { z } from "zod";

const REMITENTE_REGEX = /^([^<>\r\n]+<\S+@\S+>|\S+@\S+)$/;

export const ajustesFormSchema = z.object({
	nombreApp: z
		.string()
		.trim()
		.min(1, "El nombre de la aplicación es obligatorio")
		.max(100, "Máximo 100 caracteres"),
	colorMarca: z
		.number()
		.int("Debe ser un número entero")
		.min(0, "Mínimo 0")
		.max(360, "Máximo 360"),
	remitenteCorreo: z
		.string()
		.trim()
		.min(3, "El remitente de correos es obligatorio")
		.max(200, "Máximo 200 caracteres")
		.regex(
			REMITENTE_REGEX,
			"Usa un email válido o formato «Nombre <correo@dominio.com>»",
		),
	registroPublicoAbierto: z.boolean(),
});

export type AjustesFormValues = z.infer<typeof ajustesFormSchema>;
