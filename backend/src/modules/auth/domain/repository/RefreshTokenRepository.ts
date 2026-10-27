/**
 * Contrato de repositorio para la gestión de Refresh Tokens.
 * Define las operaciones de persistencia sin acoplarse a la infraestructura.
 */
export interface RefreshTokenRepository {
	/**
	 * Persiste un nuevo refresh token (hash) asociado a un usuario.
	 */
	crear(data: {
		tokenHash: string;
		usuarioId: number;
		expiraEn: Date;
	}): Promise<void>;

	/**
	 * Busca un refresh token activo (no revocado y no expirado) por su hash.
	 * @returns Los datos del token o null si no existe / está inválido.
	 */
	buscarValidoPorHash(
		tokenHash: string,
	): Promise<{ id: number; usuarioId: number; expiraEn: Date } | null>;

	/**
	 * Busca un refresh token por su hash sin importar si está revocado o expirado.
	 * Permite detectar la reutilización de tokens ya rotados.
	 */
	buscarPorHash(
		tokenHash: string,
	): Promise<{ id: number; usuarioId: number; revocado: boolean } | null>;

	/**
	 * Revoca un token específico por su ID de forma atómica.
	 * @returns `false` si ya estaba revocado (otra petición lo usó antes).
	 */
	revocarPorId(id: number): Promise<boolean>;

	/**
	 * Revoca todos los refresh tokens de un usuario (logout global / compromiso de cuenta).
	 */
	revocarTodosPorUsuarioId(usuarioId: number): Promise<void>;

	/**
	 * Elimina tokens expirados (revocados o no) de la base de datos (limpieza periódica).
	 */
	eliminarExpirados(): Promise<void>;
}
