/**
 * Tokens de inyección de TSyringe para las dependencias registradas por interfaz.
 * Se registran en `infrastructure/di/container.ts` y se inyectan con `@inject(TOKENS.X)`.
 */
export const TOKENS = {
	UserRepository: Symbol("UserRepository"),
	PasswordHasher: Symbol("PasswordHasher"),
	TokenService: Symbol("TokenService"),
	RefreshTokenRepository: Symbol("RefreshTokenRepository"),
	AuthorizationRepository: Symbol("AuthorizationRepository"),
	AuthMiddleware: Symbol("AuthMiddleware"),
	RequirePermissionMiddleware: Symbol("RequirePermissionMiddleware"),
	EventBus: Symbol("EventBus"),
} as const;
