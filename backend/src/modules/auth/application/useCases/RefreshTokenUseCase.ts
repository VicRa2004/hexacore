import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UsuarioRepository } from "@/core/usuario";
import type { TokenService } from "../../domain/service/TokenService";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";
import { EmisorSesion } from "../services/EmisorSesion";

export class RefreshTokenUseCase {
	constructor(
		private readonly tokenService: TokenService,
		private readonly refreshTokenRepo: RefreshTokenRepository,
		private readonly usuarioRepository: UsuarioRepository,
		private readonly emisorSesion: EmisorSesion,
	) {}

	/**
	 * Rota el refresh token: revoca el anterior y genera uno nuevo.
	 * También emite un nuevo access token.
	 *
	 * Implementa "Refresh Token Rotation" — si alguien reutiliza un token
	 * ya revocado, se asume robo y se revocan TODOS los tokens del usuario.
	 */
	async ejecutar(
		refreshTokenActual: string,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const tokenHash = this.tokenService.hashearRefreshToken(refreshTokenActual);

		const tokenGuardado =
			await this.refreshTokenRepo.buscarValidoPorHash(tokenHash);

		if (!tokenGuardado) {
			// Si el token existe pero ya estaba revocado, fue reutilizado → posible
			// robo: se revocan todas las sesiones del usuario.
			const reutilizado = await this.refreshTokenRepo.buscarPorHash(tokenHash);
			if (reutilizado?.revocado) {
				await this.refreshTokenRepo.revocarTodosPorUsuarioId(
					reutilizado.usuarioId,
				);
			}
			throw new BaseError("Refresh token inválido o expirado", 401);
		}

		// Revocar el token usado (rotación). Si otra petición concurrente ya lo
		// revocó, ésta pierde la carrera y no emite una segunda sesión.
		const revocado = await this.refreshTokenRepo.revocarPorId(tokenGuardado.id);

		if (!revocado) {
			throw new BaseError("Refresh token inválido o expirado", 401);
		}

		// Verificar que el usuario exista y esté activo
		const usuario = await this.usuarioRepository.buscarPorId(
			tokenGuardado.usuarioId,
		);

		if (!usuario?.getIsActivo()) {
			throw new BaseError("Usuario no encontrado o inactivo", 401);
		}

		return this.emisorSesion.emitir(usuario);
	}
}
