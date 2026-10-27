import { z } from "zod";

export const crearRolSchema = z.object({
	nombre: z
		.string()
		.trim()
		.min(1, "El nombre es requerido")
		.max(150, "Máximo 150 caracteres"),
	descripcion: z.string().trim().max(500, "Máximo 500 caracteres"),
});

export type CrearRolInput = z.infer<typeof crearRolSchema>;
