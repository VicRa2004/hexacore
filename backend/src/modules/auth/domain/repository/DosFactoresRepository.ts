export interface EstadoDosFactores {
	/** Secreto TOTP cifrado; con `activadoEn` nulo, el alta está pendiente. */
	secretoCifrado: string | null;
	activadoEn: Date | null;
}

/** Segundo factor TOTP del usuario y sus códigos de recuperación (hash, un solo uso). */
export interface DosFactoresRepository {
	obtener(usuarioId: number): Promise<EstadoDosFactores>;

	/** Guarda el secreto de un alta pendiente (no toca un 2FA ya activo). */
	guardarSecretoPendiente(
		usuarioId: number,
		secretoCifrado: string,
	): Promise<void>;

	/** Activa el 2FA y sustituye los códigos de recuperación. */
	activar(usuarioId: number, codigosHash: string[]): Promise<void>;

	/** Borra el secreto y los códigos de recuperación. */
	desactivar(usuarioId: number): Promise<void>;

	reemplazarCodigos(usuarioId: number, codigosHash: string[]): Promise<void>;

	/** Marca como usado un código vigente de forma atómica. @returns si existía sin usar. */
	consumirCodigo(usuarioId: number, codigoHash: string): Promise<boolean>;

	/**
	 * Guarda el paso TOTP aceptado si es posterior al último (anti-replay, atómico).
	 * @returns `false` si ese código ya se usó.
	 */
	registrarPaso(usuarioId: number, paso: number): Promise<boolean>;

	contarCodigosRestantes(usuarioId: number): Promise<number>;
}
