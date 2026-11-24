import { prisma } from "@/core/config/prisma";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { Prisma } from "@/generated/prisma/client";
import type {
	CuentaOAuth,
	CuentaOAuthRepository,
} from "../../domain/repository/CuentaOAuthRepository";
import type { NombreProveedorOAuth } from "../../domain/service/ProveedorOAuth";

export class PrismaCuentaOAuthRepository implements CuentaOAuthRepository {
	async buscarUsuarioId(
		proveedor: NombreProveedorOAuth,
		idExterno: string,
	): Promise<number | null> {
		const cuenta = await prisma.cuentaOAuth.findUnique({
			where: { proveedor_idExterno: { proveedor, idExterno } },
			select: { usuarioId: true },
		});
		return cuenta?.usuarioId ?? null;
	}

	async listar(usuarioId: number): Promise<CuentaOAuth[]> {
		const cuentas = await prisma.cuentaOAuth.findMany({
			where: { usuarioId },
			orderBy: { createdAt: "asc" },
		});
		return cuentas.map((cuenta) => ({
			proveedor: cuenta.proveedor as NombreProveedorOAuth,
			email: cuenta.email,
			vinculadaEn: cuenta.createdAt,
		}));
	}

	async vincular(data: {
		usuarioId: number;
		proveedor: NombreProveedorOAuth;
		idExterno: string;
		email: string | null;
	}): Promise<void> {
		try {
			await prisma.cuentaOAuth.create({ data });
		} catch (error) {
			// Único (usuario, proveedor): una sola cuenta de cada proveedor por usuario.
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				throw new BaseError(
					`Ya tienes otra cuenta de ${data.proveedor} vinculada. Desvincúlala primero desde tu perfil.`,
					409,
				);
			}
			throw error;
		}
	}

	async desvincular(
		usuarioId: number,
		proveedor: NombreProveedorOAuth,
	): Promise<boolean> {
		const { count } = await prisma.cuentaOAuth.deleteMany({
			where: { usuarioId, proveedor },
		});
		return count > 0;
	}
}
