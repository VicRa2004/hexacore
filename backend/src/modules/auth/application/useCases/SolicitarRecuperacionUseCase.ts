import type { UsuarioRepository } from "@/core/usuario";
import type { EmisorCorreosCuenta } from "../services/EmisorCorreosCuenta";

/**
 * Envía el enlace para restablecer la contraseña.
 * No revela si el email existe: el controlador responde igual en ambos casos.
 */
export class SolicitarRecuperacionUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly correos: EmisorCorreosCuenta,
	) {}

	async ejecutar(email: string): Promise<void> {
		const usuario = await this.usuarioRepository.buscarPorEmail(email);
		if (!usuario?.getIsActivo()) return;

		await this.correos.enviar(usuario, "recuperar_password");
	}
}
