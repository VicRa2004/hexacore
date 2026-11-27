import { apiClient } from "@/core/api/client";
import type {
	ActualizarAjustesDto,
	AjustesDto,
	AjustesPublicosDto,
} from "@/core/api/schema.gen";

export type TipoImagenAjuste = "logo" | "favicon";

export const ajustesApi = {
	async obtenerPublicos(): Promise<AjustesPublicosDto> {
		const response =
			await apiClient.get<AjustesPublicosDto>("/ajustes/publicos");
		return response.data;
	},

	async obtener(): Promise<AjustesDto> {
		const response = await apiClient.get<AjustesDto>("/ajustes");
		return response.data;
	},

	async actualizar(datos: ActualizarAjustesDto): Promise<AjustesDto> {
		const response = await apiClient.put<AjustesDto>("/ajustes", datos);
		return response.data;
	},

	async subirImagen(
		tipo: TipoImagenAjuste,
		archivo: File,
	): Promise<AjustesDto> {
		const datos = new FormData();
		datos.append("archivo", archivo);
		// Sin esta cabecera axios convertiría el FormData al JSON por defecto del cliente.
		const response = await apiClient.put<AjustesDto>(
			`/ajustes/${tipo}`,
			datos,
			{
				headers: { "Content-Type": "multipart/form-data" },
			},
		);
		return response.data;
	},

	async eliminarImagen(tipo: TipoImagenAjuste): Promise<AjustesDto> {
		const response = await apiClient.delete<AjustesDto>(`/ajustes/${tipo}`);
		return response.data;
	},
};
