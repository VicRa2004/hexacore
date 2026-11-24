import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import { DosFactoresActivadoEvent } from "../../domain/event/DosFactoresActivadoEvent";
import type { DosFactoresRepository } from "../../domain/repository/DosFactoresRepository";
import type { Cifrador } from "../../domain/service/Cifrador";
import type { CodigosRecuperacionDto } from "../dtos/DosFactoresDto";
import {
	generarCodigosRecuperacion,
	hashearCodigoRecuperacion,
	normalizarCodigo,
	verificarCodigoTotp,
} from "../services/totp";

/** Segundo paso del alta: el primer código de la app confirma el secreto y activa el 2FA. */
export class ActivarDosFactoresUseCase {
	constructor(
		private readonly dosFactores: DosFactoresRepository,
		private readonly cifrador: Cifrador,
		private readonly eventBus: EventBus,
		private readonly uow: UnitOfWork,
	) {}

	async ejecutar(
		usuarioId: number,
		codigo: string,
	): Promise<CodigosRecuperacionDto> {
		const { secretoCifrado, activadoEn } =
			await this.dosFactores.obtener(usuarioId);
		if (activadoEn) {
			throw new BaseError("La verificación en dos pasos ya está activada", 400);
		}
		if (!secretoCifrado) {
			throw new BaseError("Primero genera el código QR", 400);
		}

		const paso = verificarCodigoTotp(
			this.cifrador.descifrar(secretoCifrado),
			normalizarCodigo(codigo),
		);
		if (paso === null) {
			throw new BaseError("Código de verificación incorrecto", 400);
		}

		const codigos = generarCodigosRecuperacion();
		await this.uow.ejecutar(async () => {
			await this.dosFactores.activar(
				usuarioId,
				codigos.map(hashearCodigoRecuperacion),
			);
			await this.dosFactores.registrarPaso(usuarioId, paso);
			await this.eventBus.publish(new DosFactoresActivadoEvent({ usuarioId }));
		});
		return { codigosRecuperacion: codigos };
	}
}
