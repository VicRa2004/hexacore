import { apiClient } from "@/core/api/client";
import type { PaginatedResponse } from "@/core/api/types";
import type { User } from "@/core/auth/types";

export interface GetUsersParams {
	page?: number;
	limit?: number;
	email?: string;
}

export const usersApi = {
	async getUsers(
		params: GetUsersParams = {},
	): Promise<PaginatedResponse<User>> {
		const response = await apiClient.get<PaginatedResponse<User>>("/users", {
			params,
		});
		return response.data;
	},

	async getUserById(id: number): Promise<User> {
		const response = await apiClient.get<User>(`/users/${id}`);
		return response.data;
	},
};
