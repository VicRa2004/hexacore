import { apiClient } from "@/core/api/client";
import type { paths } from "@/core/api/schema.gen";

export interface ObtenerAuditoriaParams {
	pagina?: number;
	limite?: number;
	evento?: string;
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
