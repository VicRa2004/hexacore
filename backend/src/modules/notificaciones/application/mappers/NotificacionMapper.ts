import type {
	NotificacionDto,
	NotificacionRegistro,
} from "../../domain/repository/NotificacionRepository";

export const NotificacionMapper = {
	toDto(registro: NotificacionRegistro): NotificacionDto {
		return {
			id: registro.id,
			tipo: registro.tipo,
			datos: registro.datos,
			leida: registro.leidaEn !== null,
			leidaEn: registro.leidaEn?.toISOString() ?? null,
			createdAt: registro.createdAt.toISOString(),
		};
	},
};
