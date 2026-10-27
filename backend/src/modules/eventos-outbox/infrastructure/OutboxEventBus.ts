import { prisma } from "@/core/config/prisma";
import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";
import type {
	EventBus,
	EventHandler,
} from "@/core/shared/domain/events/EventBus";
import { contexto } from "@/core/shared/infrastructure/contexto";
import { log } from "@/core/shared/infrastructure/logger";
import type { Prisma } from "@/generated/prisma/client";

/** Tras estos intentos fallidos el evento se queda en la tabla para revisarlo a mano. */
const MAX_INTENTOS = 10;

interface FilaOutbox {
	id: number;
	nombre: string;
	datos: unknown;
	ocurrido_en: Date;
	request_id: string | null;
	usuario_id: number | null;
	intentos: number;
}

/**
 * Bus con outbox transaccional: `publish` solo inserta el evento en `evento_outbox`
 * (dentro de la transacción del caso de uso, si la hay) y `despacharPendientes`,
 * llamado por una tarea programada, lo entrega a los subscribers.
 *
 * Entrega "al menos una vez": si un subscriber falla, el evento se reintenta
 * entero, así que los subscribers deben ser idempotentes.
 */
export class OutboxEventBus implements EventBus {
	private handlers = new Map<string, EventHandler[]>();

	async publish(event: DomainEvent): Promise<void> {
		const { requestId, usuarioId } = event.meta ?? contexto.actual();
		await prisma.eventoOutbox.create({
			data: {
				nombre: event.eventName,
				datos: event.data as Prisma.InputJsonValue,
				ocurridoEn: event.occurredOn,
				requestId,
				usuarioId,
			},
		});
	}

	async publishAll(events: DomainEvent[]): Promise<void> {
		for (const event of events) await this.publish(event);
	}

	subscribe<E extends DomainEvent>(
		eventName: string,
		handler: EventHandler<E>,
	): void {
		this.handlers.set(eventName, [
			...(this.handlers.get(eventName) ?? []),
			handler as EventHandler,
		]);
	}

	/**
	 * Reclama un lote de eventos pendientes y los entrega en orden.
	 * `SKIP LOCKED` + la reserva de 1 minuto permiten varias réplicas sin duplicar trabajo.
	 */
	async despacharPendientes(lote = 50): Promise<number> {
		const filas = await prisma.$queryRaw<FilaOutbox[]>`
			UPDATE evento_outbox SET evo_reservado_hasta = now() + interval '1 minute'
			WHERE evo_id IN (
				SELECT evo_id FROM evento_outbox
				WHERE evo_procesado_en IS NULL AND evo_intentos < ${MAX_INTENTOS}
					AND (evo_reservado_hasta IS NULL OR evo_reservado_hasta < now())
				ORDER BY evo_id LIMIT ${lote}
				FOR UPDATE SKIP LOCKED
			)
			RETURNING evo_id AS id, evo_nombre AS nombre, evo_datos AS datos,
				evo_ocurrido_en AS ocurrido_en, evo_request_id AS request_id,
				evo_usuario_id AS usuario_id, evo_intentos AS intentos`;

		for (const fila of filas.sort((a, b) => a.id - b.id)) {
			await this.entregar(fila);
		}
		return filas.length;
	}

	/** Borra los eventos ya entregados hace más de `dias` días. */
	async purgarProcesados(dias = 7): Promise<void> {
		await prisma.eventoOutbox.deleteMany({
			where: { procesadoEn: { lt: new Date(Date.now() - dias * 86_400_000) } },
		});
	}

	private async entregar(fila: FilaOutbox): Promise<void> {
		const meta = {
			requestId: fila.request_id ?? undefined,
			usuarioId: fila.usuario_id ?? undefined,
		};
		const event: DomainEvent = {
			eventName: fila.nombre,
			occurredOn: fila.ocurrido_en,
			data: fila.datos,
			meta,
		};
		const handlers = [
			...(this.handlers.get(fila.nombre) ?? []),
			...(this.handlers.get("*") ?? []),
		];

		try {
			// Los logs de los subscribers llevan el requestId de la petición original.
			await contexto.ejecutar(meta, async () => {
				for (const handler of handlers) await handler(event);
			});
			await prisma.eventoOutbox.update({
				where: { id: fila.id },
				data: { procesadoEn: new Date(), reservadoHasta: null },
			});
		} catch (error) {
			log.error(`[Outbox] Falló la entrega de "${fila.nombre}" (#${fila.id})`, {
				error: String(error),
				intento: fila.intentos + 1,
			});
			await prisma.eventoOutbox.update({
				where: { id: fila.id },
				data: {
					intentos: { increment: 1 },
					ultimoError: String(error).slice(0, 2000),
					reservadoHasta: null,
				},
			});
		}
	}
}
