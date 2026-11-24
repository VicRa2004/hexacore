import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type {
	DireccionOrden,
	Paginacion,
} from "@/core/shared/domain/Paginacion";
import type {
	AuditoriaFiltros,
	AuditoriaRepository,
	CampoOrdenAuditoria,
	RegistroAuditoria,
} from "../../domain/repository/AuditoriaRepository";

/** Construye un `orderBy` determinista a partir de una lista blanca de campos. */
export function construirOrdenAuditoria(
	orden?: CampoOrdenAuditoria,
	direccion: DireccionOrden = "desc",
): Prisma.AuditoriaOrderByWithRelationInput[] {
	if (!orden) return [{ id: "desc" }];
	if (orden === "id") return [{ id: direccion }];
	return [{ [orden]: direccion }, { id: "desc" }];
}

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
		// Prefijo: `usuario.` filtra todos los eventos de usuario; el nombre exacto sigue valiendo.
		const where = {
			evento: evento ? { startsWith: evento } : undefined,
			usuarioId,
		};

		const [datos, totalElementos] = await prisma.$transaction([
			prisma.auditoria.findMany({
				where,
				skip: (pagina - 1) * limite,
				take: limite,
				orderBy: construirOrdenAuditoria(filtros.orden, filtros.direccion),
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
