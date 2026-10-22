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
	 * Busca un refresh token por su hash sin importar si está revocado o expirado.
	 * Permite detectar la reutilización de tokens ya rotados.
	 */
	findByHash(
		tokenHash: string,
	): Promise<{ id: number; userId: number; revoked: boolean } | null>;

	/**
	 * Revoca un token específico por su ID de forma atómica.
	 * @returns `false` si ya estaba revocado (otra petición lo usó antes).
	 */
	revokeById(id: number): Promise<boolean>;

	/**
	 * Revoca todos los refresh tokens de un usuario (logout global / compromiso de cuenta).
	 */
	revokeAllByUserId(userId: number): Promise<void>;

	/**
	 * Elimina tokens expirados de la base de datos (limpieza periódica).
	 */
	deleteExpired(): Promise<void>;
}
