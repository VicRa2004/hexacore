import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

/**
 * Cierra una sesión concreta del usuario (un dispositivo). Su access token sigue
 * valiendo hasta que caduca (máx. 15 min), igual que con `logout-todas`.
 */
export class CerrarSesionUseCase {
	constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

	async ejecutar(usuarioId: number, sesionId: number): Promise<void> {
		// El id cambia con cada renovación: uno viejo da 404 y el cliente recarga la lista.
		const cerrada = await this.refreshTokenRepo.revocarDeUsuario(
			sesionId,
			usuarioId,
		);
		if (!cerrada) throw new BaseError("Sesión no encontrada", 404);
	}
}
