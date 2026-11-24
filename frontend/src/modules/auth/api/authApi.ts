import { apiClient } from "@/core/api/client";
import type { AuthResponse } from "@/core/auth/types";
import type { AuthTokens } from "@/core/auth/types";
import type {
	AltaDosFactores,
	CodigosRecuperacion,
	CuentaOAuth,
	EstadoDosFactores,
	ProveedorOAuth,
	ProveedoresOAuth,
	Requiere2faResponse,
	Sesion,
	UrlAutorizacionOAuth,
} from "@/core/api/schema.gen";
import type { LoginInput, RegistroInput } from "../schemas/authSchemas";

interface Mensaje {
	mensaje: string;
}

export const authApi = {
	// Con la verificación en dos pasos activa aún no hay sesión: llega `token2fa`.
	async login(
		credentials: LoginInput,
	): Promise<AuthResponse | Requiere2faResponse> {
		const response = await apiClient.post<AuthResponse | Requiere2faResponse>(
			"/auth/login",
			credentials,
		);
		return response.data;
	},

	async loginDosFactores(datos: {
		token2fa: string;
		codigo: string;
	}): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>(
			"/auth/login/2fa",
			datos,
		);
		return response.data;
	},

	async obtenerDosFactores(): Promise<EstadoDosFactores> {
		const response = await apiClient.get<EstadoDosFactores>("/auth/2fa");
		return response.data;
	},

	async iniciarDosFactores(): Promise<AltaDosFactores> {
		const response = await apiClient.post<AltaDosFactores>("/auth/2fa/alta");
		return response.data;
	},

	async activarDosFactores(codigo: string): Promise<CodigosRecuperacion> {
		const response = await apiClient.post<CodigosRecuperacion>(
			"/auth/2fa/activar",
			{ codigo },
		);
		return response.data;
	},

	async desactivarDosFactores(datos: {
		password: string;
		codigo: string;
	}): Promise<Mensaje> {
		const response = await apiClient.post<Mensaje>(
			"/auth/2fa/desactivar",
			datos,
		);
		return response.data;
	},

	async regenerarCodigos(codigo: string): Promise<CodigosRecuperacion> {
		const response = await apiClient.post<CodigosRecuperacion>(
			"/auth/2fa/codigos-recuperacion",
			{ codigo },
		);
		return response.data;
	},

	async registro(data: RegistroInput): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>("/auth/registro", data);
		return response.data;
	},

	// Revoca el refresh token de la cookie httpOnly y la borra.
	async logout(): Promise<{ mensaje: string }> {
		const response = await apiClient.post<{ mensaje: string }>("/auth/logout");
		return response.data;
	},

	async recuperarPassword(email: string): Promise<Mensaje> {
		const response = await apiClient.post<Mensaje>("/auth/recuperar-password", {
			email,
		});
		return response.data;
	},

	async restablecerPassword(datos: {
		token: string;
		password: string;
	}): Promise<Mensaje> {
		const response = await apiClient.post<Mensaje>(
			"/auth/restablecer-password",
			datos,
		);
		return response.data;
	},

	async verificarEmail(token: string): Promise<Mensaje> {
		const response = await apiClient.post<Mensaje>("/auth/verificar-email", {
			token,
		});
		return response.data;
	},

	async reenviarVerificacion(): Promise<Mensaje> {
		const response = await apiClient.post<Mensaje>(
			"/auth/verificar-email/reenviar",
		);
		return response.data;
	},

	// Devuelve una sesión nueva: el backend revoca todas las anteriores.
	async cambiarPassword(datos: {
		passwordActual: string;
		passwordNueva: string;
	}): Promise<AuthTokens> {
		const response = await apiClient.put<AuthTokens>("/auth/password", datos);
		return response.data;
	},

	async cerrarSesiones(): Promise<Mensaje> {
		const response = await apiClient.post<Mensaje>("/auth/logout-todas");
		return response.data;
	},

	async listarSesiones(): Promise<Sesion[]> {
		const response = await apiClient.get<Sesion[]>("/auth/sesiones");
		return response.data;
	},

	async cerrarSesion(id: number): Promise<Mensaje> {
		const response = await apiClient.delete<Mensaje>(`/auth/sesiones/${id}`);
		return response.data;
	},

	// ── Login social (OAuth) ─────────────────────────────────────────────
	async proveedoresOAuth(): Promise<ProveedorOAuth[]> {
		const response = await apiClient.get<ProveedoresOAuth>(
			"/auth/oauth/proveedores",
		);
		return response.data.proveedores;
	},

	// Login (`iniciar`) o, con sesión, vincular la cuenta: la web navega a la URL devuelta.
	async urlOAuth(
		proveedor: ProveedorOAuth,
		modo: "iniciar" | "vincular",
	): Promise<string> {
		const response = await apiClient.post<UrlAutorizacionOAuth>(
			`/auth/oauth/${proveedor}/${modo}`,
		);
		return response.data.url;
	},

	async canjearOAuth(
		codigo: string,
	): Promise<AuthResponse | Requiere2faResponse> {
		const response = await apiClient.post<AuthResponse | Requiere2faResponse>(
			"/auth/oauth/canjear",
			{ codigo },
		);
		return response.data;
	},

	async cuentasOAuth(): Promise<CuentaOAuth[]> {
		const response = await apiClient.get<CuentaOAuth[]>("/auth/oauth/cuentas");
		return response.data;
	},

	async desvincularOAuth(proveedor: ProveedorOAuth): Promise<Mensaje> {
		const response = await apiClient.delete<Mensaje>(
			`/auth/oauth/cuentas/${proveedor}`,
		);
		return response.data;
	},
};
