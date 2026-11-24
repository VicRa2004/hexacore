/** Cifrado simétrico autenticado para secretos que hay que poder recuperar (p. ej. el TOTP). */
export interface Cifrador {
	cifrar(texto: string): string;
	/** @throws si el texto fue manipulado o se cifró con otra clave. */
	descifrar(cifrado: string): string;
}
