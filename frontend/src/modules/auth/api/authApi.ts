import { apiClient } from "@/core/api/client";
import type { AuthResponse } from "@/core/auth/types";
import type { AuthTokens } from "@/core/auth/types";
import type { LoginInput, RegistroInput } from "../schemas/authSchemas";

interface Mensaje {
	mensaje: string;
}

export const authApi = {
	async login(credentials: LoginInput): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>(
			"/auth/login",
			credentials,
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
};
