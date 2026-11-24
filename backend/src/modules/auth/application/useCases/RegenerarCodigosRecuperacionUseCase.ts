import type { DosFactoresRepository } from "../../domain/repository/DosFactoresRepository";
import type { CodigosRecuperacionDto } from "../dtos/DosFactoresDto";
import {
	generarCodigosRecuperacion,
	hashearCodigoRecuperacion,
} from "../services/totp";
import type { VerificadorDosFactores } from "../services/VerificadorDosFactores";

/** Invalida los códigos de recuperación anteriores y devuelve otros nuevos (solo se ven ahora). */
export class RegenerarCodigosRecuperacionUseCase {
	constructor(
		private readonly verificador: VerificadorDosFactores,
		private readonly dosFactores: DosFactoresRepository,
	) {}

	async ejecutar(
		usuarioId: number,
		codigo: string,
	): Promise<CodigosRecuperacionDto> {
		await this.verificador.verificar(usuarioId, codigo, 400);
		const codigos = generarCodigosRecuperacion();
		await this.dosFactores.reemplazarCodigos(
			usuarioId,
			codigos.map(hashearCodigoRecuperacion),
		);
		return { codigosRecuperacion: codigos };
	}
}
