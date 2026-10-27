import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

/**
 * Cierra todas las sesiones del usuario (todos los dispositivos).
 * Los access tokens ya emitidos siguen valiendo hasta que caducan (máx. 15 min).
 */
export class CerrarSesionesUseCase {
	constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

	async ejecutar(usuarioId: number): Promise<void> {
		await this.refreshTokenRepo.revocarTodosPorUsuarioId(usuarioId);
	}
}
