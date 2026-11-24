import type { NombreProveedorOAuth } from "../service/ProveedorOAuth";

export interface CuentaOAuth {
	proveedor: NombreProveedorOAuth;
	email: string | null;
	vinculadaEn: Date;
}

/** Cuentas de Google/GitHub vinculadas a usuarios (tabla `cuenta_oauth`). */
export interface CuentaOAuthRepository {
	/** @returns el ID del usuario vinculado a esa cuenta externa, o `null`. */
	buscarUsuarioId(
		proveedor: NombreProveedorOAuth,
		idExterno: string,
	): Promise<number | null>;

	listar(usuarioId: number): Promise<CuentaOAuth[]>;

	vincular(data: {
		usuarioId: number;
		proveedor: NombreProveedorOAuth;
		idExterno: string;
		email: string | null;
	}): Promise<void>;

	/** @returns `false` si el usuario no tenía ese proveedor vinculado. */
	desvincular(
		usuarioId: number,
		proveedor: NombreProveedorOAuth,
	): Promise<boolean>;
}
