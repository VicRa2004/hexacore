import type { Paginacion } from "@/core/shared/domain/Paginacion";

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
	evento?: string;
	usuarioId?: number;
}

export interface AuditoriaRepository {
	guardar(registro: Omit<RegistroAuditoria, "id">): Promise<void>;
	buscar(filtros: AuditoriaFiltros): Promise<Paginacion<RegistroAuditoria>>;
}
