import type { DireccionOrden } from "@/core/shared/domain/Paginacion";

export const CAMPOS_ORDEN_USUARIO = [
	"id",
	"nombre",
	"email",
	"isActivo",
] as const;
export type CampoOrdenUsuario = (typeof CAMPOS_ORDEN_USUARIO)[number];

export interface UsuarioFiltros {
	pagina: number;
	limite: number;
	email?: string;
	orden?: CampoOrdenUsuario;
	direccion?: DireccionOrden;
}
