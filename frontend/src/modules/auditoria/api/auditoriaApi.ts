import { isAxiosError } from "axios";
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

export interface FiltrosAuditoriaParams {
	evento?: string;
	usuarioId?: number;
	desde?: string;
	hasta?: string;
	orden?: CampoOrdenAuditoria;
	direccion?: DireccionOrden;
}

export interface ObtenerAuditoriaParams extends FiltrosAuditoriaParams {
	pagina?: number;
	limite?: number;
}

type AuditoriaPagina =
	paths["/api/auditoria"]["get"]["responses"][200]["content"]["application/json"];

function extraerNombreArchivo(header?: string): string {
	if (!header) return "auditoria.csv";
	const coincidencia = /filename="?([^";]+)"?/i.exec(header);
	return coincidencia?.[1] ?? "auditoria.csv";
}

export const auditoriaApi = {
	async obtener(params: ObtenerAuditoriaParams = {}): Promise<AuditoriaPagina> {
		const response = await apiClient.get<AuditoriaPagina>("/auditoria", {
			params,
		});
		return response.data;
	},

	async exportarCsv(
		params: FiltrosAuditoriaParams = {},
	): Promise<{ blob: Blob; nombreArchivo: string }> {
		try {
			const response = await apiClient.get<Blob>("/auditoria/exportar", {
				params,
				responseType: "blob",
			});
			const disposition = response.headers["content-disposition"];
			return {
				blob: response.data,
				nombreArchivo: extraerNombreArchivo(
					typeof disposition === "string" ? disposition : undefined,
				),
			};
		} catch (error) {
			if (isAxiosError(error) && error.response?.data instanceof Blob) {
				try {
					const texto = await error.response.data.text();
					const cuerpo = JSON.parse(texto) as { error?: string };
					if (cuerpo.error) throw new Error(cuerpo.error);
				} catch (parseError) {
					if (parseError instanceof Error && parseError.message) {
						throw parseError;
					}
				}
			}
			throw error;
		}
	},
};
