import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";

export const DIAS_RETENCION_NOTIFICACIONES = 90;

export class PurgarNotificacionesAntiguasUseCase {
	constructor(private readonly repo: NotificacionRepository) {}

	async ejecutar(dias = DIAS_RETENCION_NOTIFICACIONES): Promise<number> {
		const fechaCorte = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
		return this.repo.eliminarAnterioresA(fechaCorte);
	}
}
