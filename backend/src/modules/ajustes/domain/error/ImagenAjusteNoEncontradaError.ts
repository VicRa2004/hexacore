import { BaseError } from "@/core/shared/domain/error/BaseError";

export class ImagenAjusteNoEncontradaError extends BaseError {
	constructor(tipo: "logo" | "favicon") {
		super(`No hay ${tipo} configurado`, 404);
	}
}
