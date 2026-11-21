import { AsyncLocalStorage } from "node:async_hooks";
import { SpanKind } from "@opentelemetry/api";
import {
	ATTR_DB_COLLECTION_NAME,
	ATTR_DB_OPERATION_NAME,
	ATTR_DB_SYSTEM_NAME,
	DB_SYSTEM_NAME_VALUE_POSTGRESQL,
} from "@opentelemetry/semantic-conventions";
import { PrismaPg } from "@prisma/adapter-pg";
import {
	conSpan,
	telemetriaActiva,
} from "@/core/shared/infrastructure/telemetria";
import { type Prisma, PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const cliente = new PrismaClient({ adapter });

const transaccionActual = new AsyncLocalStorage<Prisma.TransactionClient>();

const OPERACIONES_RAW = new Set([
	"$queryRaw",
	"$executeRaw",
	"$queryRawUnsafe",
	"$executeRawUnsafe",
]);

function envolverDelegate(
	modelo: string,
	delegate: Record<string, unknown>,
): Record<string, unknown> {
	return new Proxy(delegate, {
		get(obj, op, receiver) {
			const valor = Reflect.get(obj, op, receiver);
			if (typeof op !== "string" || typeof valor !== "function") return valor;
			return (...args: unknown[]) =>
				conSpan(
					`prisma.${modelo}.${op}`,
					() => Promise.resolve(valor.apply(obj, args)),
					{
						kind: SpanKind.CLIENT,
						attributes: {
							[ATTR_DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_POSTGRESQL,
							[ATTR_DB_COLLECTION_NAME]: modelo,
							[ATTR_DB_OPERATION_NAME]: op,
						},
					},
				);
		},
	});
}

/**
 * Ejecuta `trabajo` en una transacción. Todo lo que use `prisma` dentro (cualquier
 * repositorio) se une a ella; si ya hay una abierta, se reutiliza (anidable).
 */
export function enTransaccion<T>(trabajo: () => Promise<T>): Promise<T> {
	if (transaccionActual.getStore()) return trabajo();
	return cliente.$transaction((tx) => transaccionActual.run(tx, trabajo));
}

/**
 * Cliente Prisma que delega en la transacción en curso (`enTransaccion`) o, fuera
 * de ella, en el cliente normal. Cuando OpenTelemetry está activo, envuelve cada
 * operación de modelo y consulta raw en un span `CLIENT` sin incluir argumentos (PII).
 */
const prisma = new Proxy(cliente, {
	get(objetivo, propiedad, receptor) {
		const tx = transaccionActual.getStore();
		const base = tx ?? objetivo;

		// Un `$transaction` de un repositorio dentro de otra transacción se une a ella.
		if (tx && propiedad === "$transaction") {
			return async (arg: unknown) => {
				if (typeof arg === "function") return arg(tx);
				const resultados: unknown[] = [];
				for (const consulta of arg as Promise<unknown>[]) {
					resultados.push(await consulta);
				}
				return resultados;
			};
		}

		const valor = tx
			? Reflect.get(tx, propiedad)
			: Reflect.get(objetivo, propiedad, receptor);

		if (!telemetriaActiva() || typeof propiedad !== "string") return valor;

		if (OPERACIONES_RAW.has(propiedad) && typeof valor === "function") {
			return (...args: unknown[]) =>
				conSpan(
					`prisma.${propiedad}`,
					() => Promise.resolve(valor.apply(base, args)),
					{
						kind: SpanKind.CLIENT,
						attributes: {
							[ATTR_DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_POSTGRESQL,
							[ATTR_DB_OPERATION_NAME]: propiedad,
						},
					},
				);
		}

		if (
			!propiedad.startsWith("$") &&
			!propiedad.startsWith("_") &&
			typeof valor === "object" &&
			valor !== null
		) {
			return envolverDelegate(propiedad, valor as Record<string, unknown>);
		}

		return valor;
	},
});

export { prisma };
