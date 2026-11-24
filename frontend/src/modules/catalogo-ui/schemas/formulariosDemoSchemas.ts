import { z } from "zod";

export const modalDemoSchema = z.object({
	nombre: z.string().trim().min(2, "Mínimo 2 caracteres"),
	email: z.string().trim().email("Email inválido"),
	rol: z.string().min(1, "Selecciona un rol"),
	activo: z.boolean(),
});

export const paginaDemoSchema = z.object({
	nombreOrganizacion: z.string().trim().min(2, "Mínimo 2 caracteres"),
	slug: z
		.string()
		.trim()
		.regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
	emailContacto: z.string().trim().email("Email inválido"),
	sitioWeb: z
		.string()
		.trim()
		.refine(
			(valor) => valor === "" || /^https?:\/\/.+/.test(valor),
			"Debe iniciar con http:// o https://",
		),
	zonaHoraria: z.string().min(1, "Selecciona una zona horaria"),
	plan: z.string().min(1, "Selecciona un plan"),
	notificaciones: z.boolean(),
	modoMantenimiento: z.boolean(),
});

export const pasoCuentaSchema = z.object({
	nombre: z.string().trim().min(2, "Mínimo 2 caracteres"),
	email: z.string().trim().email("Email inválido"),
	password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const pasoPerfilSchema = z.object({
	rol: z.string().min(1, "Selecciona un rol"),
	equipo: z.string().trim().min(2, "Indica un equipo"),
	recibirResumen: z.boolean(),
});

export const asistenteCompletoSchema = pasoCuentaSchema.extend(
	pasoPerfilSchema.shape,
);

export type AsistenteCompletoValores = z.infer<typeof asistenteCompletoSchema>;

/** Valida un sub-esquema de paso y devuelve los campos únicos con error. */
export function validarPasoAsistente(
	schema: z.ZodType,
	valores: unknown,
): { valido: boolean; camposConError: string[] } {
	const resultado = schema.safeParse(valores);
	if (resultado.success) {
		return { valido: true, camposConError: [] };
	}

	const campos = new Set<string>();
	for (const issue of resultado.error.issues) {
		const campo = issue.path[0];
		if (typeof campo === "string" && campo.length > 0) {
			campos.add(campo);
		}
	}

	return {
		valido: false,
		camposConError: [...campos],
	};
}
