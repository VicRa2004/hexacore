import { BaseError } from "@/core/shared/domain/error/BaseError";

export class NotificacionNoEncontradaError extends BaseError {
	constructor() {
		super("Notificación no encontrada", 404);
	}
}
