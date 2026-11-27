import type { LectorAjustes } from "@/core/shared/domain/AjustesSistema";
import type { RegistroDto } from "../dtos/RegistroDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UsuarioRepository } from "@/core/usuario";
import type { PasswordHasher } from "@/core/usuario";
import { Usuario } from "@/core/usuario";
import { EmisorSesion } from "../services/EmisorSesion";
import type { UsuarioDto } from "@/core/usuario";
import { UsuarioMapper } from "@/core/usuario";
import type { EmisorCorreosCuenta } from "../services/EmisorCorreosCuenta";

export class RegistroUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly emisorSesion: EmisorSesion,
		private readonly correos: EmisorCorreosCuenta,
		private readonly ajustes?: LectorAjustes,
	) {}

	async ejecutar(dto: RegistroDto): Promise<{
		accessToken: string;
		refreshToken: string;
		usuario: UsuarioDto;
	}> {
		if (this.ajustes) {
			const { registroPublicoAbierto } = await this.ajustes.obtener();
			if (!registroPublicoAbierto) {
				throw new BaseError("El registro público está desactivado", 403);
			}
		}

		const usuarioExistente = await this.usuarioRepository.buscarPorEmail(
			dto.email,
		);
		if (usuarioExistente) {
			throw new BaseError("Ya existe un usuario con ese email", 400);
		}

		const passwordHash = await this.passwordHasher.hash(dto.password);
		const usuario = Usuario.crear(dto.nombre, dto.email, passwordHash);

		const usuarioCreado = await this.usuarioRepository.crear(usuario);

		// Un fallo del correo no deshace el registro: se puede reenviar desde el perfil.
		await this.correos
			.enviar(usuarioCreado, "verificar_email")
			.catch((error: unknown) => console.error(error));

		return {
			...(await this.emisorSesion.emitir(usuarioCreado)),
			usuario: UsuarioMapper.toDto(usuarioCreado),
		};
	}
}
