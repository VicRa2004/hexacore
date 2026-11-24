/** Datos del usuario que viajan firmados en el access token. */
export interface AccessTokenPayload {
	id: number;
	email: string;
	roles: string[];
}

export interface TokenService {
	generarToken(payload: AccessTokenPayload): string;

	/**
	 * Verifica la firma y la expiración del access token.
	 * @throws si el token es inválido o expiró.
	 */
	verificarToken(token: string): AccessTokenPayload;

	/**
	 * Genera un string aleatorio opaco para usar como refresh token.
	 */
	generarRefreshToken(): string;

	/**
	 * Genera un hash SHA-256 del refresh token para almacenarlo en BD.
	 * Nunca se persiste el token en claro.
	 */
	hashearRefreshToken(token: string): string;

	/** Token intermedio del login con 2FA (5 min). No sirve como access token. */
	generarTokenDosPasos(usuarioId: number): string;

	/**
	 * @returns el ID del usuario.
	 * @throws si es inválido, caducó o es un access token.
	 */
	verificarTokenDosPasos(token: string): number;
}
