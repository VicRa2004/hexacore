import { describe, expect, it } from "bun:test";
import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type {
	AuditoriaFiltrosBase,
	AuditoriaRepository,
	RegistroAuditoria,
} from "../../domain/repository/AuditoriaRepository";
import { ExportarAuditoriaUseCase } from "./ExportarAuditoriaUseCase";

function crearRegistro(
	id: number,
	evento = "usuario.creado",
): RegistroAuditoria {
	return {
		id,
		evento,
		datos: { id },
		usuarioId: 1,
		requestId: `req-${id}`,
		ocurridoEn: new Date("2026-11-23T10:00:00.000Z"),
	};
}

describe("ExportarAuditoriaUseCase", () => {
	it("emite cabecera y filas por lotes y publica auditoria.exportada al finalizar", async () => {
		const lotes = [
			[crearRegistro(1), crearRegistro(2)],
			[crearRegistro(3, "usuario.eliminado")],
		];
		let tamanoSolicitado: number | undefined;
		let filtrosRecibidos: AuditoriaFiltrosBase | undefined;
		const eventosPublicados: DomainEvent[] = [];

		const repo: AuditoriaRepository = {
			async guardar() {},
			async buscar() {
				throw new Error("No usado");
			},
			async *iterarLotes(filtros, tamanoLote) {
				filtrosRecibidos = filtros;
				tamanoSolicitado = tamanoLote;
				for (const lote of lotes) {
					yield lote;
				}
			},
		};

		const eventBus: EventBus = {
			async publish(event) {
				eventosPublicados.push(event);
			},
			async publishAll() {},
			subscribe() {},
		};

		const caso = new ExportarAuditoriaUseCase(repo, eventBus, 2);
		const desde = new Date("2026-11-01T00:00:00.000Z");
		const hasta = new Date("2026-11-30T23:59:59.999Z");

		const trozos: string[] = [];
		for await (const trozo of caso.ejecutar({
			evento: "usuario.",
			usuarioId: 1,
			desde,
			hasta,
		})) {
			trozos.push(trozo);
			// Mientras se emiten los lotes aún no se ha publicado el evento.
			expect(eventosPublicados).toHaveLength(0);
		}

		expect(tamanoSolicitado).toBe(2);
		expect(filtrosRecibidos).toEqual({
			evento: "usuario.",
			usuarioId: 1,
			desde,
			hasta,
		});
		expect(trozos).toHaveLength(3);
		expect(trozos[0]).toBe(
			"id,ocurridoEn,evento,usuarioId,requestId,datos\r\n",
		);
		expect(trozos[1]).toContain("1,2026-11-23T10:00:00.000Z,usuario.creado");
		expect(trozos[2]).toContain("3,2026-11-23T10:00:00.000Z,usuario.eliminado");

		expect(eventosPublicados).toHaveLength(1);
		expect(eventosPublicados[0]?.eventName).toBe("auditoria.exportada");
		expect(eventosPublicados[0]?.data).toEqual({
			formato: "csv",
			totalRegistros: 3,
			filtros: {
				evento: "usuario.",
				usuarioId: 1,
				desde: "2026-11-01T00:00:00.000Z",
				hasta: "2026-11-30T23:59:59.999Z",
			},
		});
	});
});
