import type { DosFactoresRepository } from "../../domain/repository/DosFactoresRepository";
import type { EstadoDosFactoresDto } from "../dtos/DosFactoresDto";

export class ObtenerDosFactoresUseCase {
	constructor(private readonly dosFactores: DosFactoresRepository) {}

	async ejecutar(usuarioId: number): Promise<EstadoDosFactoresDto> {
		const { activadoEn } = await this.dosFactores.obtener(usuarioId);
		return {
			activo: activadoEn !== null,
			codigosRestantes: activadoEn
				? await this.dosFactores.contarCodigosRestantes(usuarioId)
				: 0,
		};
	}
}
