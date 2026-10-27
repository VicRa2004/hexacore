import { apiClient } from "@/core/api/client";
import type {
	AsignacionUsuario,
	PermisoDto,
	paths,
	RolDto,
} from "@/core/api/schema.gen";

export type { AsignacionUsuario, PermisoDto, RolDto };

export type GuardarRolInput =
	paths["/api/roles"]["post"]["requestBody"]["content"]["application/json"];

export const rolesApi = {
	async obtenerRoles(): Promise<RolDto[]> {
		const response = await apiClient.get<RolDto[]>("/roles");
		return response.data;
	},

	async crearRol(datos: GuardarRolInput): Promise<RolDto> {
		const response = await apiClient.post<RolDto>("/roles", datos);
		return response.data;
	},

	async actualizarRol(id: number, datos: GuardarRolInput): Promise<RolDto> {
		const response = await apiClient.put<RolDto>(`/roles/${id}`, datos);
		return response.data;
	},

	async eliminarRol(id: number): Promise<void> {
		await apiClient.delete(`/roles/${id}`);
	},

	async obtenerPermisos(): Promise<PermisoDto[]> {
		const response = await apiClient.get<PermisoDto[]>("/permisos");
		return response.data;
	},

	async obtenerAsignacion(usuarioId: number): Promise<AsignacionUsuario> {
		const response = await apiClient.get<AsignacionUsuario>(
			`/asignaciones/usuarios/${usuarioId}`,
		);
		return response.data;
	},

	async actualizarAsignacion(
		usuarioId: number,
		asignacion: AsignacionUsuario,
	): Promise<AsignacionUsuario> {
		const response = await apiClient.put<AsignacionUsuario>(
			`/asignaciones/usuarios/${usuarioId}`,
			asignacion,
		);
		return response.data;
	},
};
