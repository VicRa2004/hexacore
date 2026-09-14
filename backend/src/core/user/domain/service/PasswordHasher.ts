/**
 * Interfaz de servicio de dominio para el hash de contraseñas.
 * La implementación concreta vive en infraestructura.
 */
export interface PasswordHasher {
	hash(plainPassword: string): Promise<string>;
	compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
