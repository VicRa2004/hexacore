import { z } from "zod";
import { passwordSchema } from "@/modules/auth/schemas/authSchemas";

const base = {
	nombre: z
		.string()
		.trim()
		.min(2, "El nombre debe tener al menos 2 caracteres"),
	email: z.string().trim().email("Ingresa un correo electrónico válido"),
};

export const crearUsuarioSchema = z.object({
	...base,
	password: passwordSchema,
});

/** Al editar, la contraseña vacía significa «no cambiarla». */
export const editarUsuarioSchema = z.object({
	...base,
	password: z.string().superRefine((valor, ctx) => {
		if (!valor) return;
		const resultado = passwordSchema.safeParse(valor);
		if (!resultado.success) {
			ctx.addIssue({
				code: "custom",
				message: resultado.error.issues[0].message,
			});
		}
	}),
});

export type UsuarioFormInput = z.infer<typeof crearUsuarioSchema>;
