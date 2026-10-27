import { apiClient } from "@/core/api/client";
import type { AuthResponse } from "@/core/auth/types";
import type { LoginInput, RegistroInput } from "../schemas/authSchemas";

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
};
