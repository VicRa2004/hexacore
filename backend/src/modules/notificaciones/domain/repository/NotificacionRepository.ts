export interface NotificacionRegistro {
	id: number;
	usuarioId: number;
	tipo: string;
	datos: unknown;
	leidaEn: Date | null;
	createdAt: Date;
}

export interface NotificacionDto {
	id: number;
	tipo: string;
	datos: unknown;
	leida: boolean;
	leidaEn: string | null;
	createdAt: string;
}

export interface NotificacionFiltros {
	usuarioId: number;
	pagina: number;
	limite: number;
	soloNoLeidas?: boolean;
}

export interface PaginaNotificaciones {
	datos: NotificacionRegistro[];
	pagina: number;
	totalElementos: number;
	totalPaginas: number;
	noLeidas: number;
}

export interface NotificacionRepository {
	crear(datos: {
		usuarioId: number;
		tipo: string;
		datos: Record<string, unknown>;
	}): Promise<void>;
	listarPorUsuario(filtros: NotificacionFiltros): Promise<PaginaNotificaciones>;
	marcarLeida(
		id: number,
		usuarioId: number,
	): Promise<NotificacionRegistro | null>;
	marcarTodasLeidas(usuarioId: number): Promise<number>;
	eliminarAnterioresA(fechaCorte: Date): Promise<number>;
}
