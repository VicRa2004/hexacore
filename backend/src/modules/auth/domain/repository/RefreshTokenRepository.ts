/**
 * Contrato de repositorio para la gestión de Refresh Tokens.
 * Define las operaciones de persistencia sin acoplarse a la infraestructura.
 */
export interface RefreshTokenRepository {
	/**
	 * Persiste un nuevo refresh token (hash) asociado a un usuario.
	 */
	create(data: {
		tokenHash: string;
		userId: number;
		expiresAt: Date;
	}): Promise<void>;

	/**
	 * Busca un refresh token activo (no revocado y no expirado) por su hash.
	 * @returns Los datos del token o null si no existe / está inválido.
	 */
	findValidByHash(
		tokenHash: string,
	): Promise<{ id: number; userId: number; expiresAt: Date } | null>;

	/**
	 * Revoca un token específico por su ID.
	 */
	revokeById(id: number): Promise<void>;

	/**
	 * Revoca todos los refresh tokens de un usuario (logout global / compromiso de cuenta).
	 */
	revokeAllByUserId(userId: number): Promise<void>;

	/**
	 * Elimina tokens expirados de la base de datos (limpieza periódica).
	 */
	deleteExpired(): Promise<void>;
}
