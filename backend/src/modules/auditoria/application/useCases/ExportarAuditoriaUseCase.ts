import type { EventBus } from "@/core/shared/domain/events/EventBus";
import {
	AuditoriaExportadaEvent,
	type AuditoriaExportadaFiltros,
} from "../../domain/event/AuditoriaExportadaEvent";
import type {
	AuditoriaFiltrosBase,
	AuditoriaRepository,
} from "../../domain/repository/AuditoriaRepository";
import { CABECERA_CSV_AUDITORIA, formatearFilaAuditoriaCsv } from "../csv";

function serializarFiltros(
	filtros: AuditoriaFiltrosBase,
): AuditoriaExportadaFiltros {
	const resultado: AuditoriaExportadaFiltros = {};
	if (filtros.evento !== undefined) resultado.evento = filtros.evento;
	if (filtros.usuarioId !== undefined) resultado.usuarioId = filtros.usuarioId;
	if (filtros.desde !== undefined)
		resultado.desde = filtros.desde.toISOString();
	if (filtros.hasta !== undefined)
		resultado.hasta = filtros.hasta.toISOString();
	if (filtros.orden !== undefined) resultado.orden = filtros.orden;
	if (filtros.direccion !== undefined) resultado.direccion = filtros.direccion;
	return resultado;
}

export class ExportarAuditoriaUseCase {
	constructor(
		private readonly auditoria: AuditoriaRepository,
		private readonly eventBus: EventBus,
		private readonly tamanoLote = 500,
	) {}

	async *ejecutar(filtros: AuditoriaFiltrosBase): AsyncGenerator<string> {
		yield `${CABECERA_CSV_AUDITORIA}\r\n`;

		let totalRegistros = 0;
		for await (const lote of this.auditoria.iterarLotes(
			filtros,
			this.tamanoLote,
		)) {
			totalRegistros += lote.length;
			yield `${lote.map(formatearFilaAuditoriaCsv).join("\r\n")}\r\n`;
		}

		// Se publica tras emitir el último lote para que la exportación no aparezca en su propio CSV.
		await this.eventBus.publish(
			new AuditoriaExportadaEvent({
				formato: "csv",
				totalRegistros,
				filtros: serializarFiltros(filtros),
			}),
		);
	}
}
