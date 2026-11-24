import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";
import type { DireccionOrden } from "@/core/shared/domain/Paginacion";
import type { CampoOrdenAuditoria } from "../repository/AuditoriaRepository";

export interface AuditoriaExportadaFiltros {
	evento?: string;
	usuarioId?: number;
	desde?: string;
	hasta?: string;
	orden?: CampoOrdenAuditoria;
	direccion?: DireccionOrden;
}

export interface AuditoriaExportadaEventData {
	formato: "csv";
	totalRegistros: number;
	filtros: AuditoriaExportadaFiltros;
}

export class AuditoriaExportadaEvent implements DomainEvent {
	eventName = "auditoria.exportada";
	occurredOn: Date;
	data: AuditoriaExportadaEventData;

	constructor(data: AuditoriaExportadaEventData) {
		this.occurredOn = new Date();
		this.data = data;
	}
}
