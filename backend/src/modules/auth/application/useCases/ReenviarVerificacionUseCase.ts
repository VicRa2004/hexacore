import { BaseError } from "@/core/shared/domain/error/BaseError";
import {
	UsuarioNoEncontradoError,
	type UsuarioRepository,
} from "@/core/usuario";
import type { EmisorCorreosCuenta } from "../services/EmisorCorreosCuenta";

export class ReenviarVerificacionUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly correos: EmisorCorreosCuenta,
	) {}

	async ejecutar(usuarioId: number): Promise<void> {
		const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
		if (!usuario) throw new UsuarioNoEncontradoError();
		if (usuario.getEmailVerificado()) {
			throw new BaseError("Tu email ya está verificado", 400);
		}

		await this.correos.enviar(usuario, "verificar_email");
	}
}
