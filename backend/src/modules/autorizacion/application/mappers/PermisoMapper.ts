import type { Permiso } from "../../domain/Permiso";
import type { PermisoDto } from "../dtos/PermisoDto";

/** Transforma entidades de dominio Permiso a DTOs de salida. */
export const PermisoMapper = {
	toDto(permiso: Permiso): PermisoDto {
		return {
			id: permiso.getId(),
			recurso: permiso.getRecurso(),
			accion: permiso.getAccion(),
		};
	},

	toDtoList(permisos: Permiso[]): PermisoDto[] {
		return permisos.map(PermisoMapper.toDto);
	},
};
