import { NotificacionNoEncontradaError } from "../../domain/error/NotificacionNoEncontradaError";
import type {
	NotificacionDto,
	NotificacionRepository,
} from "../../domain/repository/NotificacionRepository";
import { NotificacionMapper } from "../mappers/NotificacionMapper";

export class MarcarNotificacionLeidaUseCase {
	constructor(private readonly repo: NotificacionRepository) {}

	async ejecutar(id: number, usuarioId: number): Promise<NotificacionDto> {
		const actualizada = await this.repo.marcarLeida(id, usuarioId);
		if (!actualizada) {
			throw new NotificacionNoEncontradaError();
		}
		return NotificacionMapper.toDto(actualizada);
	}
}
