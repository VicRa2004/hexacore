import { apiClient } from "@/core/api/client";
import type { paths } from "@/core/api/schema.gen";
import type { Usuario } from "@/core/auth/types";

export interface ObtenerUsuariosParams {
	pagina?: number;
	limite?: number;
	email?: string;
}

export type CrearUsuarioInput =
	paths["/api/usuarios"]["post"]["requestBody"]["content"]["application/json"];
export type ActualizarUsuarioInput =
	paths["/api/usuarios/{id}"]["put"]["requestBody"]["content"]["application/json"];

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

	async crearUsuario(datos: CrearUsuarioInput): Promise<Usuario> {
		const response = await apiClient.post<Usuario>("/usuarios", datos);
		return response.data;
	},

	async actualizarUsuario(
		id: number,
		datos: ActualizarUsuarioInput,
	): Promise<Usuario> {
		const response = await apiClient.put<Usuario>(`/usuarios/${id}`, datos);
		return response.data;
	},

	async eliminarUsuario(id: number): Promise<void> {
		await apiClient.delete(`/usuarios/${id}`);
	},

	async subirAvatar(archivo: File): Promise<Usuario> {
		const datos = new FormData();
		datos.append("archivo", archivo);
		// Sin esta cabecera axios convertiría el FormData al JSON por defecto del cliente.
		const response = await apiClient.put<Usuario>("/avatares", datos, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	},

	async eliminarAvatar(): Promise<Usuario> {
		const response = await apiClient.delete<Usuario>("/avatares");
		return response.data;
	},
};
