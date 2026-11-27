import type { LectorAjustes } from "@/core/shared/domain/AjustesSistema";
import type { AjustesDto } from "../dtos/AjustesDto";
import { AjustesMapper } from "../mappers/AjustesMapper";

export class ObtenerAjustesUseCase {
	constructor(private readonly lector: LectorAjustes) {}

	async ejecutar(): Promise<AjustesDto> {
		return AjustesMapper.toDto(await this.lector.obtener());
	}
}
