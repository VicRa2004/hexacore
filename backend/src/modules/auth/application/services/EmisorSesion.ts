import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { Usuario } from "@/core/usuario";
import {
	type MetodoInicioSesion,
	SesionIniciadaEvent,
} from "../../domain/event/SesionIniciadaEvent";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";
import type { TokenService } from "../../domain/service/TokenService";

/** Duración del refresh token: 7 días */
const DIAS_EXPIRACION_REFRESH_TOKEN = 7;

/**
 * Emite una sesión nueva para un usuario: access token de corta duración (15 min)
 * y refresh token opaco persistido como hash en BD.
 */
export class EmisorSesion {
	constructor(
		private readonly tokenService: TokenService,
		private readonly refreshTokenRepo: RefreshTokenRepository,
		private readonly eventBus?: EventBus,
	) {}

	async emitir(
		usuario: Usuario,
		metodoLogin?: MetodoInicioSesion,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const accessToken = this.tokenService.generarToken({
			id: usuario.getId(),
			email: usuario.getEmail(),
			roles: usuario.getRoles(),
		});

		const refreshToken = this.tokenService.generarRefreshToken();

		const expiraEn = new Date();
		expiraEn.setDate(expiraEn.getDate() + DIAS_EXPIRACION_REFRESH_TOKEN);

		await this.refreshTokenRepo.crear({
			tokenHash: this.tokenService.hashearRefreshToken(refreshToken),
			usuarioId: usuario.getId(),
			expiraEn,
		});

		if (metodoLogin && this.eventBus) {
			await this.eventBus.publish(
				new SesionIniciadaEvent({
					usuarioId: usuario.getId(),
					metodo: metodoLogin,
				}),
			);
		}

		return { accessToken, refreshToken };
	}
}
