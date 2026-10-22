import { apiClient } from "@/core/api/client";
import type { paths } from "@/core/api/schema.gen";
import type { User } from "@/core/auth/types";

export interface GetUsersParams {
	page?: number;
	limit?: number;
	email?: string;
}

type UsersPage =
	paths["/api/users"]["get"]["responses"][200]["content"]["application/json"];

export const usersApi = {
	async getUsers(params: GetUsersParams = {}): Promise<UsersPage> {
		const response = await apiClient.get<UsersPage>("/users", {
			params,
		});
		return response.data;
	},

	async getUserById(id: number): Promise<User> {
		const response = await apiClient.get<User>(`/users/${id}`);
		return response.data;
	},
};
