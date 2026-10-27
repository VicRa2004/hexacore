export type TipoTokenCuenta = "recuperar_password" | "verificar_email";

/**
 * Estado de seguridad de la cuenta: tokens de un solo uso (recuperar contraseña,
 * verificar email) y bloqueo por intentos fallidos de login.
 */
export interface CuentaRepository {
	/** Guarda el hash de un token nuevo e invalida los anteriores sin usar del mismo tipo. */
	crearToken(data: {
		usuarioId: number;
		tipo: TipoTokenCuenta;
		tokenHash: string;
		expiraEn: Date;
	}): Promise<void>;

	/**
	 * Marca como usado un token vigente de forma atómica.
	 * @returns el ID del usuario, o `null` si no existe, caducó o ya se usó.
	 */
	consumirToken(
		tokenHash: string,
		tipo: TipoTokenCuenta,
	): Promise<number | null>;

	marcarEmailVerificado(usuarioId: number): Promise<void>;

	/** @returns la fecha hasta la que la cuenta está bloqueada, o `null`. */
	bloqueadoHasta(usuarioId: number): Promise<Date | null>;

	/** Suma un fallo; al llegar a `maxIntentos` bloquea la cuenta `bloqueoMs` y reinicia el contador. */
	registrarFallo(
		usuarioId: number,
		politica: { maxIntentos: number; bloqueoMs: number },
	): Promise<void>;

	reiniciarFallos(usuarioId: number): Promise<void>;
}
