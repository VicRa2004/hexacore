import { enTransaccion } from "@/core/config/prisma";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";

/** Transacción interactiva de Prisma; los repositorios se unen a ella solos. */
export class PrismaUnitOfWork implements UnitOfWork {
	ejecutar<T>(trabajo: () => Promise<T>): Promise<T> {
		return enTransaccion(trabajo);
	}
}
