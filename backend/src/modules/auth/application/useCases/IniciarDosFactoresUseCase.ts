import { BaseError } from "@/core/shared/domain/error/BaseError";
import {
	UsuarioNoEncontradoError,
	type UsuarioRepository,
} from "@/core/usuario";
import type { DosFactoresRepository } from "../../domain/repository/DosFactoresRepository";
import type { Cifrador } from "../../domain/service/Cifrador";
import type { AltaDosFactoresDto } from "../dtos/DosFactoresDto";
import { generarSecretoTotp, uriOtpauth } from "../services/totp";

/** Primer paso del alta: genera un secreto nuevo (sustituye a uno pendiente) y su URI para el QR. */
export class IniciarDosFactoresUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly dosFactores: DosFactoresRepository,
		private readonly cifrador: Cifrador,
		private readonly emisor: string,
	) {}

	async ejecutar(usuarioId: number): Promise<AltaDosFactoresDto> {
		const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
		if (!usuario) throw new UsuarioNoEncontradoError();
		const { activadoEn } = await this.dosFactores.obtener(usuarioId);
		if (activadoEn) {
			throw new BaseError("La verificación en dos pasos ya está activada", 400);
		}

		const secreto = generarSecretoTotp();
		await this.dosFactores.guardarSecretoPendiente(
			usuarioId,
			this.cifrador.cifrar(secreto),
		);
		return {
			secreto,
			otpauthUri: uriOtpauth(secreto, usuario.getEmail(), this.emisor),
		};
	}
}
