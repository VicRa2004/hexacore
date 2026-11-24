import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { CuentaRepository } from "../../domain/repository/CuentaRepository";
import type { DosFactoresRepository } from "../../domain/repository/DosFactoresRepository";
import type { Cifrador } from "../../domain/service/Cifrador";
import { POLITICA_BLOQUEO } from "../useCases/LoginUseCase";
import {
	hashearCodigoRecuperacion,
	normalizarCodigo,
	verificarCodigoTotp,
} from "./totp";

/**
 * Comprueba el segundo factor de un usuario con el 2FA activo: código TOTP
 * (sin reutilizar uno ya aceptado) o código de recuperación (se consume).
 * Comparte el bloqueo por cuenta con la contraseña: 5 fallos → 15 min.
 */
export class VerificadorDosFactores {
	constructor(
		private readonly dosFactores: DosFactoresRepository,
		private readonly cifrador: Cifrador,
		private readonly cuentaRepo: CuentaRepository,
	) {}

	/** @param statusFallo 401 en el login; 400 con sesión (un 401 haría renovar el token en la web). */
	async verificar(
		usuarioId: number,
		codigo: string,
		statusFallo: 400 | 401,
	): Promise<void> {
		const { secretoCifrado, activadoEn } =
			await this.dosFactores.obtener(usuarioId);
		if (!secretoCifrado || !activadoEn) {
			throw new BaseError("La verificación en dos pasos no está activada", 400);
		}
		if (await this.cuentaRepo.bloqueadoHasta(usuarioId)) {
			throw new BaseError(
				"Cuenta bloqueada temporalmente por demasiados intentos fallidos. Inténtalo más tarde.",
				429,
			);
		}

		const normalizado = normalizarCodigo(codigo);
		let isValido: boolean;
		if (/^\d{6}$/.test(normalizado)) {
			const paso = verificarCodigoTotp(
				this.cifrador.descifrar(secretoCifrado),
				normalizado,
			);
			isValido =
				paso !== null &&
				(await this.dosFactores.registrarPaso(usuarioId, paso));
		} else {
			isValido = await this.dosFactores.consumirCodigo(
				usuarioId,
				hashearCodigoRecuperacion(normalizado),
			);
		}

		if (!isValido) {
			await this.cuentaRepo.registrarFallo(usuarioId, POLITICA_BLOQUEO);
			throw new BaseError("Código de verificación incorrecto", statusFallo);
		}
		await this.cuentaRepo.reiniciarFallos(usuarioId);
	}
}
