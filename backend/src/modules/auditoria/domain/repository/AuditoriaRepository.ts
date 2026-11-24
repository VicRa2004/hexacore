import type {
	DireccionOrden,
	Paginacion,
} from "@/core/shared/domain/Paginacion";

export const CAMPOS_ORDEN_AUDITORIA = [
	"id",
	"ocurridoEn",
	"evento",
	"usuarioId",
] as const;
export type CampoOrdenAuditoria = (typeof CAMPOS_ORDEN_AUDITORIA)[number];

/** Modelo de lectura: un registro de auditoría no tiene comportamiento ni se modifica. */
export interface RegistroAuditoria {
	id: number;
	evento: string;
	datos: unknown;
	usuarioId: number | null;
	requestId: string | null;
	ocurridoEn: Date;
}

export interface AuditoriaFiltros {
	pagina: number;
	limite: number;
	/** Prefijo del nombre del evento (`usuario.` o `usuario.creado`). */
	evento?: string;
	usuarioId?: number;
	orden?: CampoOrdenAuditoria;
	direccion?: DireccionOrden;
}

export interface AuditoriaRepository {
	guardar(registro: Omit<RegistroAuditoria, "id">): Promise<void>;
	buscar(filtros: AuditoriaFiltros): Promise<Paginacion<RegistroAuditoria>>;
}
