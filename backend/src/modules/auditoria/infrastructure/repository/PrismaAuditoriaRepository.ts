import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type { Paginacion } from "@/core/shared/domain/Paginacion";
import type {
	AuditoriaFiltros,
	AuditoriaRepository,
	RegistroAuditoria,
} from "../../domain/repository/AuditoriaRepository";

export class PrismaAuditoriaRepository implements AuditoriaRepository {
	async guardar(registro: Omit<RegistroAuditoria, "id">): Promise<void> {
		await prisma.auditoria.create({
			data: {
				...registro,
				datos: (registro.datos ?? {}) as Prisma.InputJsonValue,
			},
		});
	}

	async buscar(
		filtros: AuditoriaFiltros,
	): Promise<Paginacion<RegistroAuditoria>> {
		const { pagina, limite, evento, usuarioId } = filtros;
		const where = { evento, usuarioId };

		const [datos, totalElementos] = await prisma.$transaction([
			prisma.auditoria.findMany({
				where,
				skip: (pagina - 1) * limite,
				take: limite,
				orderBy: { id: "desc" },
			}),
			prisma.auditoria.count({ where }),
		]);

		return {
			datos,
			pagina,
			totalElementos,
			totalPaginas: Math.ceil(totalElementos / limite),
		};
	}
}
