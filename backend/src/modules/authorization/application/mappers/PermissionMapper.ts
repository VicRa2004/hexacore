import type { Permission } from "../../domain/Permission";
import type { PermissionDto } from "../dtos/PermissionDto";

/** Transforma entidades de dominio Permission a DTOs de salida. */
export const PermissionMapper = {
	toDto(permission: Permission): PermissionDto {
		return {
			id: permission.getId(),
			resource: permission.getResource(),
			action: permission.getAction(),
		};
	},

	toDtoList(permissions: Permission[]): PermissionDto[] {
		return permissions.map(PermissionMapper.toDto);
	},
};
