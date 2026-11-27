import type { LectorAjustes } from "@/core/shared/domain/AjustesSistema";
import type { AjustesPublicosDto } from "../dtos/AjustesDto";
import { AjustesMapper } from "../mappers/AjustesMapper";

export class ObtenerAjustesPublicosUseCase {
	constructor(private readonly lector: LectorAjustes) {}

	async ejecutar(): Promise<AjustesPublicosDto> {
		return AjustesMapper.toPublicosDto(await this.lector.obtener());
	}
}
