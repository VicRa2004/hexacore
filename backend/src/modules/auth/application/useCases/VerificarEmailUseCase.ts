import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { CuentaRepository } from "../../domain/repository/CuentaRepository";
import type { TokenService } from "../../domain/service/TokenService";

export class VerificarEmailUseCase {
	constructor(
		private readonly tokenService: TokenService,
		private readonly cuentaRepo: CuentaRepository,
	) {}

	async ejecutar(token: string): Promise<void> {
		const usuarioId = await this.cuentaRepo.consumirToken(
			this.tokenService.hashearRefreshToken(token),
			"verificar_email",
		);
		if (!usuarioId) {
			throw new BaseError("El enlace no es válido o ha caducado", 400);
		}

		await this.cuentaRepo.marcarEmailVerificado(usuarioId);
	}
}
