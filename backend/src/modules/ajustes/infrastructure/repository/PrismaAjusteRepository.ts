import { prisma } from "@/core/config/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
	AjusteRepository,
	EntradaAjuste,
} from "../../domain/repository/AjusteRepository";

export class PrismaAjusteRepository implements AjusteRepository {
	async obtenerTodos(): Promise<Map<string, unknown>> {
		const filas = await prisma.ajuste.findMany();
		return new Map(filas.map((f) => [f.clave, f.valor]));
	}

	async guardarVarios(entradas: EntradaAjuste[]): Promise<void> {
		for (const entrada of entradas) {
			const valor = entrada.valor as Prisma.InputJsonValue;
			await prisma.ajuste.upsert({
				where: { clave: entrada.clave },
				update: { valor },
				create: { clave: entrada.clave, valor },
			});
		}
	}

	async eliminar(clave: string): Promise<void> {
		await prisma.ajuste.deleteMany({ where: { clave } });
	}
}
