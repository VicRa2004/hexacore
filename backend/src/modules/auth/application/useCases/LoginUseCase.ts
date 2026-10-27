import type { LoginDto } from "../dtos/LoginDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UsuarioRepository } from "@/core/usuario";
import type { PasswordHasher } from "@/core/usuario";
import { EmisorSesion } from "../services/EmisorSesion";
import type { UsuarioDto } from "@/core/usuario";
import { UsuarioMapper } from "@/core/usuario";

/**
 * Hash bcrypt de una contraseña aleatoria: si el email no existe se compara
 * igualmente contra él, para que la respuesta tarde lo mismo.
 */
const HASH_PASSWORD_FICTICIO =
	"$2b$10$UZQKZ7yo9nGiqhSbmYdj4eV9jrthslRlUx4lX.r5eMN.sW4Pb.boi";

export class LoginUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly emisorSesion: EmisorSesion,
	) {}

	async ejecutar(dto: LoginDto): Promise<{
		accessToken: string;
		refreshToken: string;
		usuario: UsuarioDto;
	}> {
		const usuario = await this.usuarioRepository.buscarPorEmail(dto.email);

		const isPasswordValido = await this.passwordHasher.comparar(
			dto.password,
			usuario?.getPasswordHash() ?? HASH_PASSWORD_FICTICIO,
		);

		if (!usuario || !isPasswordValido) {
			throw new BaseError("Credenciales inválidas", 401);
		}

		if (!usuario.getIsActivo()) {
			throw new BaseError("El usuario está inactivo", 403);
		}

		return {
			...(await this.emisorSesion.emitir(usuario)),
			usuario: UsuarioMapper.toDto(usuario),
		};
	}
}
