import type { Permission } from "../../domain/Permission";
import type { PermissionDto } from "../dtos/PermissionDto";

/** Transforma entidades de dominio Permission a DTOs de salida. */
export class PermissionMapper {
	static toDto(permission: Permission): PermissionDto {
		return {
			id: permission.getId(),
			resource: permission.getResource(),
			action: permission.getAction(),
		};
	}

	static toDtoList(permissions: Permission[]): PermissionDto[] {
		return permissions.map(PermissionMapper.toDto);
	}
}
