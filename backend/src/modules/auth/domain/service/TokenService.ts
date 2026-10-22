/** Datos del usuario que viajan firmados en el access token. */
export interface AccessTokenPayload {
	id: number;
	email: string;
	roles: string[];
}

export interface TokenService {
	generateToken(payload: AccessTokenPayload): string;

	/**
	 * Verifica la firma y la expiración del access token.
	 * @throws si el token es inválido o expiró.
	 */
	verifyToken(token: string): AccessTokenPayload;

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
