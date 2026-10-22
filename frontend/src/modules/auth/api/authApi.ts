import { apiClient } from "@/core/api/client";
import type { AuthResponse } from "@/core/auth/types";
import type { LoginInput, RegisterInput } from "../schemas/authSchemas";

export const authApi = {
	async login(credentials: LoginInput): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>(
			"/auth/login",
			credentials,
		);
		return response.data;
	},

	async register(data: RegisterInput): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>("/auth/register", data);
		return response.data;
	},

	// Revoca el refresh token de la cookie httpOnly y la borra.
	async logout(): Promise<{ message: string }> {
		const response = await apiClient.post<{ message: string }>("/auth/logout");
		return response.data;
	},
};
