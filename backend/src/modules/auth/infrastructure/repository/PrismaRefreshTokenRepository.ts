import { prisma } from "@/core/config/prisma";
import { contexto } from "@/core/shared/infrastructure/contexto";
import type {
	RefreshTokenRepository,
	SesionActiva,
} from "../../domain/repository/RefreshTokenRepository";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
	async crear(data: {
		tokenHash: string;
		usuarioId: number;
		expiraEn: Date;
	}): Promise<void> {
		await prisma.refreshToken.create({
			data: {
				tokenHash: data.tokenHash,
				usuarioId: data.usuarioId,
				expiraEn: data.expiraEn,
				// Dispositivo de la petición que abre o renueva la sesión.
				userAgent: contexto.actual().userAgent,
			},
		});
	}

	async buscarValidoPorHash(
		tokenHash: string,
	): Promise<{ id: number; usuarioId: number; expiraEn: Date } | null> {
		const registro = await prisma.refreshToken.findUnique({
			where: {
				tokenHash,
				revocado: false,
				expiraEn: { gt: new Date() },
			},
		});

		if (!registro) return null;

		return {
			id: registro.id,
			usuarioId: registro.usuarioId,
			expiraEn: registro.expiraEn,
		};
	}

	async buscarPorHash(
		tokenHash: string,
	): Promise<{ id: number; usuarioId: number; revocado: boolean } | null> {
		const registro = await prisma.refreshToken.findUnique({
			where: { tokenHash },
			select: { id: true, usuarioId: true, revocado: true },
		});

		return registro;
	}

	async revocarPorId(id: number): Promise<boolean> {
		const { count } = await prisma.refreshToken.updateMany({
			where: { id, revocado: false },
			data: { revocado: true },
		});

		return count === 1;
	}

	async revocarTodosPorUsuarioId(usuarioId: number): Promise<void> {
		await prisma.refreshToken.updateMany({
			where: { usuarioId, revocado: false },
			data: { revocado: true },
		});
	}

	async listarActivosPorUsuario(usuarioId: number): Promise<SesionActiva[]> {
		const registros = await prisma.refreshToken.findMany({
			where: { usuarioId, revocado: false, expiraEn: { gt: new Date() } },
			orderBy: { createdAt: "desc" },
		});
		return registros.map((r) => ({
			id: r.id,
			tokenHash: r.tokenHash,
			userAgent: r.userAgent,
			ultimoUso: r.createdAt,
			expiraEn: r.expiraEn,
		}));
	}

	async eliminarDeUsuario(id: number, usuarioId: number): Promise<boolean> {
		const { count } = await prisma.refreshToken.deleteMany({
			where: { id, usuarioId, revocado: false },
		});
		return count === 1;
	}

	async eliminarExpirados(): Promise<void> {
		// Los revocados aún vigentes se conservan: detectan la reutilización de tokens.
		await prisma.refreshToken.deleteMany({
			where: { expiraEn: { lt: new Date() } },
		});
	}
}
