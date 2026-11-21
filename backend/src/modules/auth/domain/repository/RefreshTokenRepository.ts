/** Sesión abierta: el refresh token vigente de un dispositivo (la rotación deja uno por sesión). */
export interface SesionActiva {
	id: number;
	tokenHash: string;
	userAgent: string | null;
	/** Inicio de sesión o última renovación. */
	ultimoUso: Date;
	expiraEn: Date;
}

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

	/** Refresh tokens vigentes del usuario (uno por sesión abierta), del más reciente al más antiguo. */
	listarActivosPorUsuario(usuarioId: number): Promise<SesionActiva[]>;

	/**
	 * Revoca un token vigente solo si es de ese usuario.
	 * @returns `false` si no existe, es de otro usuario o ya estaba revocado.
	 */
	revocarDeUsuario(id: number, usuarioId: number): Promise<boolean>;

	/**
	 * Elimina tokens expirados (revocados o no) de la base de datos (limpieza periódica).
	 */
	eliminarExpirados(): Promise<void>;
}
