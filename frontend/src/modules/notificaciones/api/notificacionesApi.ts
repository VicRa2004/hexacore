import { isAxiosError } from "axios";
import { apiClient } from "@/core/api/client";
import type { paths } from "@/core/api/schema.gen";

export type NotificacionesPagina =
	paths["/api/notificaciones"]["get"]["responses"][200]["content"]["application/json"];

export type NotificacionItem = NotificacionesPagina["datos"][number];

export type MarcarTodasLeidasRespuesta =
	paths["/api/notificaciones/leer-todas"]["patch"]["responses"][200]["content"]["application/json"];

export interface ListarNotificacionesParams {
	pagina?: number;
	limite?: number;
	soloNoLeidas?: boolean;
}

export const notificacionesApi = {
	async listar(
		params: ListarNotificacionesParams = {},
	): Promise<NotificacionesPagina | null> {
		try {
			const response = await apiClient.get<NotificacionesPagina>(
				"/notificaciones",
				{
					params: {
						pagina: params.pagina,
						limite: params.limite,
						...(params.soloNoLeidas !== undefined
							? { soloNoLeidas: String(params.soloNoLeidas) }
							: {}),
					},
				},
			);
			return response.data;
		} catch (error) {
			// Módulo opcional: si el backend no lo monta (404), se oculta la campana.
			if (isAxiosError(error) && error.response?.status === 404) {
				return null;
			}
			throw error;
		}
	},

	async marcarLeida(id: number): Promise<NotificacionItem> {
		const response = await apiClient.patch<NotificacionItem>(
			`/notificaciones/${id}/leer`,
		);
		return response.data;
	},

	async marcarTodasLeidas(): Promise<MarcarTodasLeidasRespuesta> {
		const response = await apiClient.patch<MarcarTodasLeidasRespuesta>(
			"/notificaciones/leer-todas",
		);
		return response.data;
	},
};
