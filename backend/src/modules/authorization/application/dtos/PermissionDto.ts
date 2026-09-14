/** DTO de salida que representa un permiso serializable hacia HTTP. */
export interface PermissionDto {
	id: number;
	resource: string;
	action: string;
}
