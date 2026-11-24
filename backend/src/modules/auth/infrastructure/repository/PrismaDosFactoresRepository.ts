import { prisma } from "@/core/config/prisma";
import type {
	DosFactoresRepository,
	EstadoDosFactores,
} from "../../domain/repository/DosFactoresRepository";

export class PrismaDosFactoresRepository implements DosFactoresRepository {
	async obtener(usuarioId: number): Promise<EstadoDosFactores> {
		const usuario = await prisma.usuario.findUnique({
			where: { id: usuarioId },
			select: { totpSecreto: true, totpActivadoEn: true },
		});
		return {
			secretoCifrado: usuario?.totpSecreto ?? null,
			activadoEn: usuario?.totpActivadoEn ?? null,
		};
	}

	async guardarSecretoPendiente(
		usuarioId: number,
		secretoCifrado: string,
	): Promise<void> {
		await prisma.usuario.updateMany({
			where: { id: usuarioId, totpActivadoEn: null },
			data: { totpSecreto: secretoCifrado, totpUltimoPaso: null },
		});
	}

	async activar(usuarioId: number, codigosHash: string[]): Promise<void> {
		await prisma.$transaction([
			prisma.usuario.update({
				where: { id: usuarioId },
				data: { totpActivadoEn: new Date() },
			}),
			...this.sustituirCodigos(usuarioId, codigosHash),
		]);
	}

	async desactivar(usuarioId: number): Promise<void> {
		await prisma.$transaction([
			prisma.usuario.update({
				where: { id: usuarioId },
				data: { totpSecreto: null, totpActivadoEn: null, totpUltimoPaso: null },
			}),
			prisma.codigoRecuperacion.deleteMany({ where: { usuarioId } }),
		]);
	}

	async reemplazarCodigos(
		usuarioId: number,
		codigosHash: string[],
	): Promise<void> {
		await prisma.$transaction(this.sustituirCodigos(usuarioId, codigosHash));
	}

	async consumirCodigo(
		usuarioId: number,
		codigoHash: string,
	): Promise<boolean> {
		const { count } = await prisma.codigoRecuperacion.updateMany({
			where: { usuarioId, codigoHash, usadoEn: null },
			data: { usadoEn: new Date() },
		});
		return count === 1;
	}

	async registrarPaso(usuarioId: number, paso: number): Promise<boolean> {
		const { count } = await prisma.usuario.updateMany({
			where: {
				id: usuarioId,
				OR: [{ totpUltimoPaso: null }, { totpUltimoPaso: { lt: paso } }],
			},
			data: { totpUltimoPaso: paso },
		});
		return count === 1;
	}

	contarCodigosRestantes(usuarioId: number): Promise<number> {
		return prisma.codigoRecuperacion.count({
			where: { usuarioId, usadoEn: null },
		});
	}

	private sustituirCodigos(usuarioId: number, codigosHash: string[]) {
		return [
			prisma.codigoRecuperacion.deleteMany({ where: { usuarioId } }),
			prisma.codigoRecuperacion.createMany({
				data: codigosHash.map((codigoHash) => ({ usuarioId, codigoHash })),
			}),
		];
	}
}
