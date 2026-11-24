import { BaseError } from "@/core/shared/domain/error/BaseError";
import {
	type UsuarioDto,
	UsuarioMapper,
	type UsuarioRepository,
} from "@/core/usuario";
import type { TokenService } from "../../domain/service/TokenService";
import type { LoginDosFactoresDto } from "../dtos/DosFactoresDto";
import type { EmisorSesion } from "../services/EmisorSesion";
import type { VerificadorDosFactores } from "../services/VerificadorDosFactores";

/** Segundo paso del login: canjea el token intermedio + el código por la sesión. */
export class LoginDosFactoresUseCase {
	constructor(
		private readonly tokenService: TokenService,
		private readonly usuarioRepository: UsuarioRepository,
		private readonly verificador: VerificadorDosFactores,
		private readonly emisorSesion: EmisorSesion,
	) {}

	async ejecutar(dto: LoginDosFactoresDto): Promise<{
		accessToken: string;
		refreshToken: string;
		usuario: UsuarioDto;
	}> {
		let usuarioId: number;
		try {
			usuarioId = this.tokenService.verificarTokenDosPasos(dto.token2fa);
		} catch {
			throw new BaseError(
				"El inicio de sesión ha caducado. Vuelve a introducir tu contraseña.",
				401,
			);
		}

		await this.verificador.verificar(usuarioId, dto.codigo, 401);

		const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
		if (!usuario) throw new BaseError("Credenciales inválidas", 401);
		if (!usuario.getIsActivo()) {
			throw new BaseError("El usuario está inactivo", 403);
		}

		return {
			...(await this.emisorSesion.emitir(usuario)),
			usuario: UsuarioMapper.toDto(usuario),
		};
	}
}
