export const PROVEEDORES_OAUTH = ["google", "github"] as const;
export type NombreProveedorOAuth = (typeof PROVEEDORES_OAUTH)[number];

/** Datos del usuario que devuelve el proveedor tras canjear el código de autorización. */
export interface PerfilOAuth {
	idExterno: string;
	nombre: string;
	/** `null` si el proveedor no comparte ningún email. */
	email: string | null;
	/** El proveedor garantiza que el email es del usuario. */
	emailVerificado: boolean;
}

/** Proveedor de identidad externo (flujo Authorization Code con PKCE). */
export interface ProveedorOAuth {
	readonly nombre: NombreProveedorOAuth;

	urlAutorizacion(params: {
		state: string;
		codeChallenge: string;
		redirectUri: string;
	}): string;

	/**
	 * Canjea el código por un token y lee el perfil del usuario.
	 * @throws si el proveedor rechaza el código.
	 */
	obtenerPerfil(params: {
		code: string;
		codeVerifier: string;
		redirectUri: string;
	}): Promise<PerfilOAuth>;
}
