import { z } from "zod";

/** ID numérico desde params de ruta */
export const permissionIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "El ID debe ser un número válido")
    .transform(Number),
});

/** Cuerpo para crear un permiso */
export const createPermissionSchema = z.object({
  resource: z
    .string()
    .min(1, "resource no puede estar vacío")
    .max(100, "resource no puede superar 100 caracteres"),
  action: z
    .string()
    .min(1, "action no puede estar vacío")
    .max(50, "action no puede superar 50 caracteres"),
});

/** Cuerpo para actualizar un permiso (ambos campos requeridos) */
export const updatePermissionSchema = z.object({
  resource: z
    .string()
    .min(1, "resource no puede estar vacío")
    .max(100, "resource no puede superar 100 caracteres"),
  action: z
    .string()
    .min(1, "action no puede estar vacío")
    .max(50, "action no puede superar 50 caracteres"),
});

/** ID de usuario desde params de ruta (para permisos efectivos) */
export const userIdParamSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "El userId debe ser un número válido")
    .transform(Number),
});
