import { token } from "@/core/shared/infrastructure/di/DependencyContainer";
import type { UserRepository } from "../domain/repository/UserRepository";
import type { PasswordHasher } from "../domain/service/PasswordHasher";

/** Lo que `user` comparte con otros módulos (p. ej. `auth`). Se registra en `user/module.ts`. */
export const USER_TOKENS = {
	UserRepository: token<UserRepository>("UserRepository"),
	PasswordHasher: token<PasswordHasher>("PasswordHasher"),
} as const;
