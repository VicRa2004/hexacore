/** DTO de entrada para reemplazar un rol (nombre, descripción y permisos). */
export interface ActualizarRolDto {
	nombre: string;
	descripcion?: string | null;
	permisoIds: number[];
}
