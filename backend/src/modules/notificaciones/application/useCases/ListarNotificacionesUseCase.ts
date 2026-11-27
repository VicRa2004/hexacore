import type {
	NotificacionDto,
	NotificacionFiltros,
	NotificacionRepository,
} from "../../domain/repository/NotificacionRepository";
import { NotificacionMapper } from "../mappers/NotificacionMapper";

export interface PaginaNotificacionesDto {
	datos: NotificacionDto[];
	pagina: number;
	totalElementos: number;
	totalPaginas: number;
	noLeidas: number;
}

export class ListarNotificacionesUseCase {
	constructor(private readonly repo: NotificacionRepository) {}

	async ejecutar(
		filtros: NotificacionFiltros,
	): Promise<PaginaNotificacionesDto> {
		const pagina = await this.repo.listarPorUsuario(filtros);
		return {
			datos: pagina.datos.map(NotificacionMapper.toDto),
			pagina: pagina.pagina,
			totalElementos: pagina.totalElementos,
			totalPaginas: pagina.totalPaginas,
			noLeidas: pagina.noLeidas,
		};
	}
}
