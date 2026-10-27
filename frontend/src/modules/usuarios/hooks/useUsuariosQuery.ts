import { useQuery } from "@tanstack/react-query";
import { type ObtenerUsuariosParams, usuariosApi } from "../api/usuariosApi";

export const usuariosKeys = {
	all: ["usuarios"] as const,
	lists: () => [...usuariosKeys.all, "list"] as const,
	list: (params: ObtenerUsuariosParams) =>
		[...usuariosKeys.lists(), params] as const,
	details: () => [...usuariosKeys.all, "detail"] as const,
	detail: (id: number) => [...usuariosKeys.details(), id] as const,
};

export function useUsuariosQuery(params: ObtenerUsuariosParams = {}) {
	return useQuery({
		queryKey: usuariosKeys.list(params),
		queryFn: () => usuariosApi.obtenerUsuarios(params),
	});
}
