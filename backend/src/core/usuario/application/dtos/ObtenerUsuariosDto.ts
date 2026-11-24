import type { DireccionOrden } from "@/core/shared/domain/Paginacion";
import type { CampoOrdenUsuario } from "../../domain/repository/UsuarioFiltros";

export interface ObtenerUsuariosDto {
	pagina: number;
	limite: number;
	email?: string;
	orden?: CampoOrdenUsuario;
	direccion?: DireccionOrden;
}
