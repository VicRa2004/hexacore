import { token } from "@/core/shared/infrastructure/di/DependencyContainer";
import type { AuthMiddleware } from "./http/middlewares/authMiddleware";

/** Lo que `auth` comparte con otros módulos. Se registra en `auth/module.ts`. */
export const AUTH_TOKENS = {
	AuthMiddleware: token<AuthMiddleware>("AuthMiddleware"),
} as const;
