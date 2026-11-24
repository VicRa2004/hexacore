import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { CuentaOAuthRepository } from "../../domain/repository/CuentaOAuthRepository";
import type {
	NombreProveedorOAuth,
	PerfilOAuth,
} from "../../domain/service/ProveedorOAuth";

/** Vuelta del proveedor en modo vincular (desde el perfil, con sesión). */
export class VincularOAuthUseCase {
	constructor(private readonly cuentasOAuth: CuentaOAuthRepository) {}

	async ejecutar(
		usuarioId: number,
		proveedor: NombreProveedorOAuth,
		perfil: PerfilOAuth,
	): Promise<void> {
		const vinculado = await this.cuentasOAuth.buscarUsuarioId(
			proveedor,
			perfil.idExterno,
		);
		if (vinculado === usuarioId) return;
		if (vinculado) {
			throw new BaseError(
				`Esa cuenta de ${proveedor} ya está vinculada a otro usuario`,
				409,
			);
		}

		await this.cuentasOAuth.vincular({
			usuarioId,
			proveedor,
			idExterno: perfil.idExterno,
			email: perfil.email,
		});
	}
}
