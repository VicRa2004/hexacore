import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { CuentaOAuthRepository } from "../../domain/repository/CuentaOAuthRepository";
import type { NombreProveedorOAuth } from "../../domain/service/ProveedorOAuth";

export class DesvincularOAuthUseCase {
	constructor(private readonly cuentasOAuth: CuentaOAuthRepository) {}

	async ejecutar(
		usuarioId: number,
		proveedor: NombreProveedorOAuth,
	): Promise<void> {
		if (!(await this.cuentasOAuth.desvincular(usuarioId, proveedor))) {
			throw new BaseError(
				`No tienes una cuenta de ${proveedor} vinculada`,
				404,
			);
		}
	}
}
