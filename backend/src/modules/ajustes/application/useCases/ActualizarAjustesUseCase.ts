import type { LectorAjustes } from "@/core/shared/domain/AjustesSistema";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import { ajustesActualizacionSchema } from "../../domain/AjustesConfig";
import { AjustesActualizadosEvent } from "../../domain/event/AjustesActualizadosEvent";
import type {
	AjusteRepository,
	EntradaAjuste,
} from "../../domain/repository/AjusteRepository";
import type { ActualizarAjustesDto, AjustesDto } from "../dtos/AjustesDto";
import { AjustesMapper } from "../mappers/AjustesMapper";

export class ActualizarAjustesUseCase {
	constructor(
		private readonly repo: AjusteRepository,
		private readonly lector: LectorAjustes,
		private readonly eventBus: EventBus,
		private readonly uow: UnitOfWork,
	) {}

	async ejecutar(dto: ActualizarAjustesDto): Promise<AjustesDto> {
		const validados = ajustesActualizacionSchema.parse(dto);
		const entradas: EntradaAjuste[] = [];
		for (const [clave, valor] of Object.entries(validados)) {
			if (valor !== undefined) {
				entradas.push({ clave, valor });
			}
		}

		await this.uow.ejecutar(async () => {
			await this.repo.guardarVarios(entradas);
			await this.eventBus.publish(
				new AjustesActualizadosEvent({
					claves: entradas.map((e) => e.clave),
				}),
			);
		});

		this.lector.invalidar();
		return AjustesMapper.toDto(await this.lector.obtener());
	}
}
