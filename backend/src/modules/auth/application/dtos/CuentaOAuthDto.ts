import type { NombreProveedorOAuth } from "../../domain/service/ProveedorOAuth";

export interface CuentaOAuthDto {
	proveedor: NombreProveedorOAuth;
	email: string | null;
	vinculadaEn: string;
}
