import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/core/config/prisma";
import type {
	NotificacionFiltros,
	NotificacionRegistro,
	NotificacionRepository,
	PaginaNotificaciones,
} from "../../domain/repository/NotificacionRepository";

export class PrismaNotificacionRepository implements NotificacionRepository {
	async crear(datos: {
		usuarioId: number;
		tipo: string;
		datos: Record<string, unknown>;
	}): Promise<void> {
		await prisma.notificacion.create({
			data: {
				usuarioId: datos.usuarioId,
				tipo: datos.tipo,
				datos: datos.datos as Prisma.InputJsonValue,
			},
		});
	}

	async listarPorUsuario(
		filtros: NotificacionFiltros,
	): Promise<PaginaNotificaciones> {
		const { usuarioId, pagina, limite, soloNoLeidas } = filtros;
		const where: Prisma.NotificacionWhereInput = {
			usuarioId,
			...(soloNoLeidas ? { leidaEn: null } : {}),
		};

		const [datos, totalElementos, noLeidas] = await prisma.$transaction([
			prisma.notificacion.findMany({
				where,
				skip: (pagina - 1) * limite,
				take: limite,
				orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			}),
			prisma.notificacion.count({ where }),
			prisma.notificacion.count({ where: { usuarioId, leidaEn: null } }),
		]);

		return {
			datos,
			pagina,
			totalElementos,
			totalPaginas: Math.ceil(totalElementos / limite),
			noLeidas,
		};
	}

	async marcarLeida(
		id: number,
		usuarioId: number,
	): Promise<NotificacionRegistro | null> {
		const existente = await prisma.notificacion.findFirst({
			where: { id, usuarioId },
		});
		if (!existente) return null;
		if (existente.leidaEn) return existente;

		return prisma.notificacion.update({
			where: { id },
			data: { leidaEn: new Date() },
		});
	}

	async marcarTodasLeidas(usuarioId: number): Promise<number> {
		const { count } = await prisma.notificacion.updateMany({
			where: { usuarioId, leidaEn: null },
			data: { leidaEn: new Date() },
		});
		return count;
	}

	async eliminarAnterioresA(fechaCorte: Date): Promise<number> {
		const { count } = await prisma.notificacion.deleteMany({
			where: { createdAt: { lt: fechaCorte } },
		});
		return count;
	}
}
