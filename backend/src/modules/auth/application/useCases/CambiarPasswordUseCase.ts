import { BaseError } from "@/core/shared/domain/error/BaseError";
import {
	type PasswordHasher,
	UsuarioNoEncontradoError,
	type UsuarioRepository,
} from "@/core/usuario";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";
import type { CambiarPasswordDto } from "../dtos/CambiarPasswordDto";
import type { EmisorSesion } from "../services/EmisorSesion";

/**
 * Cambia la contraseña del propio usuario y cierra el resto de sesiones:
 * revoca todos los refresh tokens y emite una sesión nueva para este dispositivo.
 */
export class CambiarPasswordUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly refreshTokenRepo: RefreshTokenRepository,
		private readonly emisorSesion: EmisorSesion,
	) {}

	async ejecutar(
		usuarioId: number,
		dto: CambiarPasswordDto,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
		if (!usuario) throw new UsuarioNoEncontradoError();

		const isActualValida = await this.passwordHasher.comparar(
			dto.passwordActual,
			usuario.getPasswordHash(),
		);
		if (!isActualValida) {
			throw new BaseError("La contraseña actual no es correcta", 400);
		}

		usuario.actualizar({
			passwordHash: await this.passwordHasher.hash(dto.passwordNueva),
		});
		await this.usuarioRepository.actualizar(usuario);
		await this.refreshTokenRepo.revocarTodosPorUsuarioId(usuarioId);

		return this.emisorSesion.emitir(usuario);
	}
}
