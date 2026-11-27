import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UsuarioDto, UsuarioRepository } from "@/core/usuario";
import { UsuarioMapper } from "@/core/usuario";
import type { CuentaRepository } from "../../domain/repository/CuentaRepository";
import type { DosFactoresRepository } from "../../domain/repository/DosFactoresRepository";
import type { TokenService } from "../../domain/service/TokenService";
import type { EmisorSesion } from "../services/EmisorSesion";

/**
 * Canjea el código de un solo uso de la vuelta OAuth por la misma sesión que el
 * login con contraseña (o por el paso del 2FA si el usuario lo tiene activo).
 */
export class CanjearOAuthUseCase {
	constructor(
		private readonly tokenService: TokenService,
		private readonly cuentaRepo: CuentaRepository,
		private readonly usuarios: UsuarioRepository,
		private readonly dosFactores: DosFactoresRepository,
		private readonly emisorSesion: EmisorSesion,
	) {}

	async ejecutar(
		codigo: string,
	): Promise<
		| { accessToken: string; refreshToken: string; usuario: UsuarioDto }
		| { requiere2fa: true; token2fa: string }
	> {
		const usuarioId = await this.cuentaRepo.consumirToken(
			this.tokenService.hashearRefreshToken(codigo),
			"oauth_login",
		);
		if (!usuarioId) {
			throw new BaseError(
				"El inicio de sesión caducó o ya se usó. Vuelve a intentarlo.",
				400,
			);
		}

		const usuario = await this.usuarios.buscarPorId(usuarioId);
		if (!usuario?.getIsActivo()) {
			throw new BaseError("El usuario está inactivo", 403);
		}
		// El bloqueo por intentos fallidos también frena la entrada social.
		if (await this.cuentaRepo.bloqueadoHasta(usuarioId)) {
			throw new BaseError(
				"Cuenta bloqueada temporalmente por demasiados intentos fallidos. Inténtalo más tarde.",
				429,
			);
		}

		const { activadoEn } = await this.dosFactores.obtener(usuarioId);
		if (activadoEn) {
			return {
				requiere2fa: true,
				token2fa: this.tokenService.generarTokenDosPasos(usuarioId),
			};
		}

		return {
			...(await this.emisorSesion.emitir(usuario, "oauth")),
			usuario: UsuarioMapper.toDto(usuario),
		};
	}
}
