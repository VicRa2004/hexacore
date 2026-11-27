import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";

export class MarcarTodasLeidasUseCase {
	constructor(private readonly repo: NotificacionRepository) {}

	async ejecutar(usuarioId: number): Promise<{ actualizadas: number }> {
		const actualizadas = await this.repo.marcarTodasLeidas(usuarioId);
		return { actualizadas };
	}
}
