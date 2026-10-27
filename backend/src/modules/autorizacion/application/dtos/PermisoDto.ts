/** DTO de salida que representa un permiso serializable hacia HTTP. */
export interface PermisoDto {
	id: number;
	recurso: string;
	accion: string;
}
