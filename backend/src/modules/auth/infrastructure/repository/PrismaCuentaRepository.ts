import { prisma } from "@/core/config/prisma";
import type {
	CuentaRepository,
	TipoTokenCuenta,
} from "../../domain/repository/CuentaRepository";

export class PrismaCuentaRepository implements CuentaRepository {
	async crearToken(data: {
		usuarioId: number;
		tipo: TipoTokenCuenta;
		tokenHash: string;
		expiraEn: Date;
	}): Promise<void> {
		// Solo vale el último enlace enviado.
		await prisma.$transaction([
			prisma.tokenCuenta.deleteMany({
				where: { usuarioId: data.usuarioId, tipo: data.tipo, usadoEn: null },
			}),
			prisma.tokenCuenta.create({ data }),
		]);
	}

	async consumirToken(
		tokenHash: string,
		tipo: TipoTokenCuenta,
	): Promise<number | null> {
		const { count } = await prisma.tokenCuenta.updateMany({
			where: { tokenHash, tipo, usadoEn: null, expiraEn: { gt: new Date() } },
			data: { usadoEn: new Date() },
		});
		if (count !== 1) return null;

		const token = await prisma.tokenCuenta.findUnique({
			where: { tokenHash },
			select: { usuarioId: true },
		});
		return token?.usuarioId ?? null;
	}

	async marcarEmailVerificado(usuarioId: number): Promise<void> {
		await prisma.usuario.updateMany({
			where: { id: usuarioId, emailVerificadoEn: null },
			data: { emailVerificadoEn: new Date() },
		});
	}

	async bloqueadoHasta(usuarioId: number): Promise<Date | null> {
		const usuario = await prisma.usuario.findUnique({
			where: { id: usuarioId },
			select: { bloqueadoHasta: true },
		});
		const hasta = usuario?.bloqueadoHasta;
		return hasta && hasta > new Date() ? hasta : null;
	}

	async registrarFallo(
		usuarioId: number,
		{ maxIntentos, bloqueoMs }: { maxIntentos: number; bloqueoMs: number },
	): Promise<void> {
		const { intentosFallidos } = await prisma.usuario.update({
			where: { id: usuarioId },
			data: { intentosFallidos: { increment: 1 } },
			select: { intentosFallidos: true },
		});
		if (intentosFallidos >= maxIntentos) {
			await prisma.usuario.update({
				where: { id: usuarioId },
				data: {
					intentosFallidos: 0,
					bloqueadoHasta: new Date(Date.now() + bloqueoMs),
				},
			});
		}
	}

	async reiniciarFallos(usuarioId: number): Promise<void> {
		await prisma.usuario.updateMany({
			where: {
				id: usuarioId,
				OR: [
					{ intentosFallidos: { gt: 0 } },
					{ bloqueadoHasta: { not: null } },
				],
			},
			data: { intentosFallidos: 0, bloqueadoHasta: null },
		});
	}
}
