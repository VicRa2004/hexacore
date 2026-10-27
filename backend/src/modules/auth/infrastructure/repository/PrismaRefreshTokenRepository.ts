import { prisma } from "@/core/config/prisma";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

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

	async eliminarExpirados(): Promise<void> {
		// Los revocados aún vigentes se conservan: detectan la reutilización de tokens.
		await prisma.refreshToken.deleteMany({
			where: { expiraEn: { lt: new Date() } },
		});
	}
}
