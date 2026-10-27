import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { enTransaccion, prisma } from "@/core/config/prisma";
import { contexto } from "@/core/shared/infrastructure/contexto";
import { OutboxEventBus } from "./OutboxEventBus";

const evento = () => ({
	eventName: "prueba.ocurrida",
	occurredOn: new Date(),
	data: { n: 1 },
});

describe("OutboxEventBus (e2e)", () => {
	beforeEach(async () => {
		await prisma.eventoOutbox.deleteMany();
	});

	it("debería entregar el evento después, con el contexto de la petición que lo publicó", async () => {
		const bus = new OutboxEventBus();
		const handler = mock();
		bus.subscribe("*", handler);

		await contexto.ejecutar({ requestId: "req-9", usuarioId: 3 }, () =>
			bus.publish(evento()),
		);
		expect(handler).not.toHaveBeenCalled();

		expect(await bus.despacharPendientes()).toBe(1);
		expect(handler).toHaveBeenCalledWith(
			expect.objectContaining({
				eventName: "prueba.ocurrida",
				data: { n: 1 },
				meta: { requestId: "req-9", usuarioId: 3 },
			}),
		);
		expect(await bus.despacharPendientes()).toBe(0);
	});

	it("no debería guardar el evento si la transacción del caso de uso falla", async () => {
		const bus = new OutboxEventBus();

		await expect(
			enTransaccion(async () => {
				await bus.publish(evento());
				throw new Error("rollback");
			}),
		).rejects.toThrow();

		expect(await prisma.eventoOutbox.count()).toBe(0);
	});

	it("debería anotar el error y reintentar si un subscriber falla", async () => {
		spyOn(console, "error").mockImplementation(() => {});
		const bus = new OutboxEventBus();
		bus.subscribe("prueba.ocurrida", () => {
			throw new Error("boom");
		});
		await bus.publish(evento());

		await bus.despacharPendientes();

		const fila = await prisma.eventoOutbox.findFirstOrThrow();
		expect(fila).toMatchObject({ intentos: 1, procesadoEn: null });
		expect(fila.ultimoError).toContain("boom");
	});
});
