import type { LoginDto } from "../dtos/LoginDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UsuarioRepository } from "@/core/usuario";
import type { PasswordHasher } from "@/core/usuario";
import { EmisorSesion } from "../services/EmisorSesion";
import type { UsuarioDto } from "@/core/usuario";
import { UsuarioMapper } from "@/core/usuario";
import type { CuentaRepository } from "../../domain/repository/CuentaRepository";

/**
 * Hash bcrypt de una contraseña aleatoria: si el email no existe se compara
 * igualmente contra él, para que la respuesta tarde lo mismo.
 */
const HASH_PASSWORD_FICTICIO =
	"$2b$10$UZQKZ7yo9nGiqhSbmYdj4eV9jrthslRlUx4lX.r5eMN.sW4Pb.boi";

/** Bloqueo por cuenta (además del rate limit por IP): frena ataques distribuidos. */
const POLITICA_BLOQUEO = { maxIntentos: 5, bloqueoMs: 15 * 60 * 1000 };

export class LoginUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly emisorSesion: EmisorSesion,
		private readonly cuentaRepo: CuentaRepository,
	) {}

	async ejecutar(dto: LoginDto): Promise<{
		accessToken: string;
		refreshToken: string;
		usuario: UsuarioDto;
	}> {
		const usuario = await this.usuarioRepository.buscarPorEmail(dto.email);

		// Bloqueada: ni se comprueba la contraseña, para no dar pistas durante el bloqueo.
		if (usuario && (await this.cuentaRepo.bloqueadoHasta(usuario.getId()))) {
			throw new BaseError(
				"Cuenta bloqueada temporalmente por demasiados intentos fallidos. Inténtalo más tarde o restablece tu contraseña.",
				429,
			);
		}

		const isPasswordValido = await this.passwordHasher.comparar(
			dto.password,
			usuario?.getPasswordHash() ?? HASH_PASSWORD_FICTICIO,
		);

		if (!usuario || !isPasswordValido) {
			if (usuario) {
				await this.cuentaRepo.registrarFallo(usuario.getId(), POLITICA_BLOQUEO);
			}
			throw new BaseError("Credenciales inválidas", 401);
		}

		await this.cuentaRepo.reiniciarFallos(usuario.getId());

		if (!usuario.getIsActivo()) {
			throw new BaseError("El usuario está inactivo", 403);
		}

		return {
			...(await this.emisorSesion.emitir(usuario)),
			usuario: UsuarioMapper.toDto(usuario),
		};
	}
}
