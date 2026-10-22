import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

@injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
	async create(data: {
		tokenHash: string;
		userId: number;
		expiresAt: Date;
	}): Promise<void> {
		await prisma.refreshToken.create({
			data: {
				tokenHash: data.tokenHash,
				userId: data.userId,
				expiresAt: data.expiresAt,
			},
		});
	}

	async findValidByHash(
		tokenHash: string,
	): Promise<{ id: number; userId: number; expiresAt: Date } | null> {
		const record = await prisma.refreshToken.findUnique({
			where: {
				tokenHash,
				revoked: false,
				expiresAt: { gt: new Date() },
			},
		});

		if (!record) return null;

		return {
			id: record.id,
			userId: record.userId,
			expiresAt: record.expiresAt,
		};
	}

	async findByHash(
		tokenHash: string,
	): Promise<{ id: number; userId: number; revoked: boolean } | null> {
		const record = await prisma.refreshToken.findUnique({
			where: { tokenHash },
			select: { id: true, userId: true, revoked: true },
		});

		return record;
	}

	async revokeById(id: number): Promise<boolean> {
		const { count } = await prisma.refreshToken.updateMany({
			where: { id, revoked: false },
			data: { revoked: true },
		});

		return count === 1;
	}

	async revokeAllByUserId(userId: number): Promise<void> {
		await prisma.refreshToken.updateMany({
			where: { userId, revoked: false },
			data: { revoked: true },
		});
	}

	async deleteExpired(): Promise<void> {
		await prisma.refreshToken.deleteMany({
			where: {
				OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }],
			},
		});
	}
}
