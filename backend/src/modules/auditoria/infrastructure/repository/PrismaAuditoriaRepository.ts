import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type {
	DireccionOrden,
	Paginacion,
} from "@/core/shared/domain/Paginacion";
import type {
	AuditoriaFiltros,
	AuditoriaFiltrosBase,
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

export function construirWhereAuditoria(
	filtros: AuditoriaFiltrosBase,
): Prisma.AuditoriaWhereInput {
	const ocurridoEn =
		filtros.desde || filtros.hasta
			? {
					...(filtros.desde ? { gte: filtros.desde } : {}),
					...(filtros.hasta ? { lte: filtros.hasta } : {}),
				}
			: undefined;

	return {
		// Prefijo: `usuario.` filtra todos los eventos de usuario; el nombre exacto sigue valiendo.
		evento: filtros.evento ? { startsWith: filtros.evento } : undefined,
		usuarioId: filtros.usuarioId,
		ocurridoEn,
	};
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
		const { pagina, limite } = filtros;
		const where = construirWhereAuditoria(filtros);

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

	async *iterarLotes(
		filtros: AuditoriaFiltrosBase,
		tamanoLote = 500,
	): AsyncIterable<RegistroAuditoria[]> {
		const where = construirWhereAuditoria(filtros);
		const orderBy = construirOrdenAuditoria(filtros.orden, filtros.direccion);
		let cursorId: number | undefined;

		while (true) {
			const lote = await prisma.auditoria.findMany({
				where,
				orderBy,
				take: tamanoLote,
				...(cursorId !== undefined
					? { cursor: { id: cursorId }, skip: 1 }
					: {}),
			});

			if (lote.length === 0) break;
			yield lote;
			if (lote.length < tamanoLote) break;

			cursorId = lote[lote.length - 1]?.id;
		}
	}
}
