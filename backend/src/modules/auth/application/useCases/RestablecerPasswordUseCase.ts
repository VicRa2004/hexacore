import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { PasswordHasher, UsuarioRepository } from "@/core/usuario";
import type { CuentaRepository } from "../../domain/repository/CuentaRepository";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";
import type { TokenService } from "../../domain/service/TokenService";
import type { RestablecerPasswordDto } from "../dtos/RestablecerPasswordDto";

/**
 * Cambia la contraseña con un token de recuperación válido, cierra todas las
 * sesiones y desbloquea la cuenta. El enlace también prueba que el email es suyo.
 */
export class RestablecerPasswordUseCase {
	constructor(
		private readonly tokenService: TokenService,
		private readonly cuentaRepo: CuentaRepository,
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly refreshTokenRepo: RefreshTokenRepository,
	) {}

	async ejecutar(dto: RestablecerPasswordDto): Promise<void> {
		const usuarioId = await this.cuentaRepo.consumirToken(
			this.tokenService.hashearRefreshToken(dto.token),
			"recuperar_password",
		);
		const usuario = usuarioId
			? await this.usuarioRepository.buscarPorId(usuarioId)
			: null;

		if (!usuario?.getIsActivo()) {
			throw new BaseError("El enlace no es válido o ha caducado", 400);
		}

		usuario.actualizar({
			passwordHash: await this.passwordHasher.hash(dto.password),
		});
		await this.usuarioRepository.actualizar(usuario);
		await this.refreshTokenRepo.revocarTodosPorUsuarioId(usuario.getId());
		await this.cuentaRepo.reiniciarFallos(usuario.getId());
		await this.cuentaRepo.marcarEmailVerificado(usuario.getId());
	}
}
