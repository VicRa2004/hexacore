import { AsyncLocalStorage } from "node:async_hooks";
import { PrismaPg } from "@prisma/adapter-pg";
import { type Prisma, PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const cliente = new PrismaClient({ adapter });

const transaccionActual = new AsyncLocalStorage<Prisma.TransactionClient>();

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
 * de ella, en el cliente normal. Así los repositorios no reciben `tx` por parámetro.
 */
const prisma = new Proxy(cliente, {
	get(objetivo, propiedad, receptor) {
		const tx = transaccionActual.getStore();
		if (!tx) return Reflect.get(objetivo, propiedad, receptor);

		// Un `$transaction` de un repositorio dentro de otra transacción se une a ella.
		if (propiedad === "$transaction") {
			return async (arg: unknown) => {
				if (typeof arg === "function") return arg(tx);
				const resultados: unknown[] = [];
				for (const consulta of arg as Promise<unknown>[]) {
					resultados.push(await consulta);
				}
				return resultados;
			};
		}
		return Reflect.get(tx, propiedad);
	},
});

export { prisma };
