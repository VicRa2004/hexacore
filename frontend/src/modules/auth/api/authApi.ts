import { apiClient } from "@/core/api/client";
import type { AuthResponse, AuthTokens } from "@/core/auth/types";
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

	async logout(refreshToken: string): Promise<{ message: string }> {
		const response = await apiClient.post<{ message: string }>("/auth/logout", {
			refreshToken,
		});
		return response.data;
	},

	async refresh(refreshToken: string): Promise<AuthTokens> {
		const response = await apiClient.post<AuthTokens>("/auth/refresh", {
			refreshToken,
		});
		return response.data;
	},
};
