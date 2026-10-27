import type { AuthResponse, paths, UsuarioDto } from "@/core/api/schema.gen";

export type { AuthResponse };
export type Usuario = UsuarioDto;

// El refresh token vive en una cookie httpOnly que gestiona el backend.
export type AuthTokens =
	paths["/api/auth/refresh"]["post"]["responses"][200]["content"]["application/json"];

export interface AuthState {
	usuario: Usuario | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	login: (payload: AuthResponse) => void;
	setTokens: (tokens: AuthTokens) => void;
	logout: () => void;
	actualizarUsuario: (datosUsuario: Partial<Usuario>) => void;
}
