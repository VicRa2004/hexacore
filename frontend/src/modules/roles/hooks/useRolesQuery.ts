import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "../api/rolesApi";

export const rolesKeys = {
	all: ["roles"] as const,
	list: () => [...rolesKeys.all, "list"] as const,
	permisos: () => [...rolesKeys.all, "permisos"] as const,
	asignacion: (usuarioId: number) =>
		[...rolesKeys.all, "asignacion", usuarioId] as const,
};

export function useRolesQuery() {
	return useQuery({
		queryKey: rolesKeys.list(),
		queryFn: rolesApi.obtenerRoles,
	});
}

export function usePermisosQuery() {
	return useQuery({
		queryKey: rolesKeys.permisos(),
		queryFn: rolesApi.obtenerPermisos,
	});
}

export function useAsignacionQuery(usuarioId: number) {
	return useQuery({
		queryKey: rolesKeys.asignacion(usuarioId),
		queryFn: () => rolesApi.obtenerAsignacion(usuarioId),
	});
}
