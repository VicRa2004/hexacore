/** Tokens de TSyringe propios del módulo `auth`. Se registran en `auth/module.ts`. */
export const AUTH_TOKENS = {
	TokenService: Symbol("TokenService"),
	RefreshTokenRepository: Symbol("RefreshTokenRepository"),
	AuthMiddleware: Symbol("AuthMiddleware"),
} as const;
