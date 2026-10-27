import { token } from "@/core/shared/infrastructure/di/DependencyContainer";
import type { UsuarioRepository } from "../domain/repository/UsuarioRepository";
import type { PasswordHasher } from "../domain/service/PasswordHasher";

/** Lo que `usuario` comparte con otros módulos (p. ej. `auth`). Se registra en `usuario/module.ts`. */
export const USUARIO_TOKENS = {
	UsuarioRepository: token<UsuarioRepository>("UsuarioRepository"),
	PasswordHasher: token<PasswordHasher>("PasswordHasher"),
} as const;
