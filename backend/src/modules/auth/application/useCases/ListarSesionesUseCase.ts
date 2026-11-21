import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";
import type { TokenService } from "../../domain/service/TokenService";
import type { SesionDto } from "../dtos/SesionDto";

/** Sesiones abiertas del usuario (una por dispositivo), marcando la actual. */
export class ListarSesionesUseCase {
	constructor(
		private readonly tokenService: TokenService,
		private readonly refreshTokenRepo: RefreshTokenRepository,
	) {}

	async ejecutar(
		usuarioId: number,
		refreshTokenActual?: string,
	): Promise<SesionDto[]> {
		const hashActual =
			refreshTokenActual &&
			this.tokenService.hashearRefreshToken(refreshTokenActual);
		const sesiones =
			await this.refreshTokenRepo.listarActivosPorUsuario(usuarioId);

		return sesiones.map((s) => ({
			id: s.id,
			userAgent: s.userAgent,
			ultimoUso: s.ultimoUso.toISOString(),
			expiraEn: s.expiraEn.toISOString(),
			actual: s.tokenHash === hashActual,
		}));
	}
}
