import type { Rol } from "../../domain/Rol";
import type { RolDto } from "../dtos/RolDto";
import { PermisoMapper } from "./PermisoMapper";

/** Transforma entidades de dominio Rol a DTOs de salida. */
export const RolMapper = {
	toDto(rol: Rol): RolDto {
		return {
			id: rol.getId(),
			nombre: rol.getNombre(),
			descripcion: rol.getDescripcion(),
			permisos: PermisoMapper.toDtoList(rol.getPermisos()),
		};
	},

	toDtoList(roles: Rol[]): RolDto[] {
		return roles.map(RolMapper.toDto);
	},
};
