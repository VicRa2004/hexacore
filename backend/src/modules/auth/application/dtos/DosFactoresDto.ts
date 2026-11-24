export interface EstadoDosFactoresDto {
	activo: boolean;
	/** Códigos de recuperación sin usar. */
	codigosRestantes: number;
}

export interface AltaDosFactoresDto {
	/** Secreto en base32 para teclearlo a mano en la app. */
	secreto: string;
	/** URI `otpauth://` que codifica el QR. */
	otpauthUri: string;
}

export interface CodigosRecuperacionDto {
	/** Se muestran una sola vez: en BD solo queda su hash. */
	codigosRecuperacion: string[];
}

export interface DesactivarDosFactoresDto {
	password: string;
	/** Código TOTP o de recuperación. */
	codigo: string;
}

export interface LoginDosFactoresDto {
	token2fa: string;
	codigo: string;
}
