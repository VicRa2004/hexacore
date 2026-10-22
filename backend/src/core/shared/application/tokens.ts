/**
 * Tokens de inyección de TSyringe del núcleo (`core/`). Cada módulo de `src/modules/`
 * define los suyos en `application/tokens.ts` y los registra en su `module.ts`.
 */
export const TOKENS = {
	UserRepository: Symbol("UserRepository"),
	PasswordHasher: Symbol("PasswordHasher"),
	EventBus: Symbol("EventBus"),
	PermissionGuard: Symbol("PermissionGuard"),
} as const;
