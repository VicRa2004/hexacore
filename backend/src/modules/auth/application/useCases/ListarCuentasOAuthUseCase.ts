import type { CuentaOAuthRepository } from "../../domain/repository/CuentaOAuthRepository";
import type { CuentaOAuthDto } from "../dtos/CuentaOAuthDto";

export class ListarCuentasOAuthUseCase {
	constructor(private readonly cuentasOAuth: CuentaOAuthRepository) {}

	async ejecutar(usuarioId: number): Promise<CuentaOAuthDto[]> {
		const cuentas = await this.cuentasOAuth.listar(usuarioId);
		return cuentas.map((cuenta) => ({
			proveedor: cuenta.proveedor,
			email: cuenta.email,
			vinculadaEn: cuenta.vinculadaEn.toISOString(),
		}));
	}
}
