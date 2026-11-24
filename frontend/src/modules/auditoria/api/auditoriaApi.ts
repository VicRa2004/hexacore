import { apiClient } from "@/core/api/client";
import type { paths } from "@/core/api/schema.gen";
import type { DireccionOrden } from "@/core/router/searchParams";

export const CAMPOS_ORDEN_AUDITORIA = [
	"id",
	"ocurridoEn",
	"evento",
	"usuarioId",
] as const;
export type CampoOrdenAuditoria = (typeof CAMPOS_ORDEN_AUDITORIA)[number];

export interface ObtenerAuditoriaParams {
	pagina?: number;
	limite?: number;
	evento?: string;
	orden?: CampoOrdenAuditoria;
	direccion?: DireccionOrden;
}

type AuditoriaPagina =
	paths["/api/auditoria"]["get"]["responses"][200]["content"]["application/json"];

export const auditoriaApi = {
	async obtener(params: ObtenerAuditoriaParams = {}): Promise<AuditoriaPagina> {
		const response = await apiClient.get<AuditoriaPagina>("/auditoria", {
			params,
		});
		return response.data;
	},
};
