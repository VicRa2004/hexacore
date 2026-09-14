export interface TokenService {
	generateToken(payload: object, expiresIn?: string): string;
	verifyToken(token: string): object | string;

	/**
	 * Genera un string aleatorio opaco para usar como refresh token.
	 */
	generateRefreshToken(): string;

	/**
	 * Genera un hash SHA-256 del refresh token para almacenarlo en BD.
	 * Nunca se persiste el token en claro.
	 */
	hashRefreshToken(token: string): string;
}
