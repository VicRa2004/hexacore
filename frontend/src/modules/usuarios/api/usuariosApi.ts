import { apiClient } from "@/core/api/client";
import type { paths } from "@/core/api/schema.gen";
import type { Usuario } from "@/core/auth/types";

export interface ObtenerUsuariosParams {
	pagina?: number;
	limite?: number;
	email?: string;
}

type UsuariosPagina =
	paths["/api/usuarios"]["get"]["responses"][200]["content"]["application/json"];

export const usuariosApi = {
	async obtenerUsuarios(
		params: ObtenerUsuariosParams = {},
	): Promise<UsuariosPagina> {
		const response = await apiClient.get<UsuariosPagina>("/usuarios", {
			params,
		});
		return response.data;
	},

	async obtenerUsuarioPorId(id: number): Promise<Usuario> {
		const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
		return response.data;
	},
};
