import { useQuery } from "@tanstack/react-query";
import { type GetUsersParams, usersApi } from "../api/usersApi";

export const usersKeys = {
	all: ["users"] as const,
	lists: () => [...usersKeys.all, "list"] as const,
	list: (params: GetUsersParams) => [...usersKeys.lists(), params] as const,
	details: () => [...usersKeys.all, "detail"] as const,
	detail: (id: number) => [...usersKeys.details(), id] as const,
};

export function useUsersQuery(params: GetUsersParams = {}) {
	return useQuery({
		queryKey: usersKeys.list(params),
		queryFn: () => usersApi.getUsers(params),
	});
}

export function useUserQuery(id: number, enabled = true) {
	return useQuery({
		queryKey: usersKeys.detail(id),
		queryFn: () => usersApi.getUserById(id),
		enabled: enabled && id > 0,
	});
}
