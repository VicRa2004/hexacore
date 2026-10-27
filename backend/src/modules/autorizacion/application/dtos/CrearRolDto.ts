/** DTO de entrada para crear un rol. */
export interface CrearRolDto {
	nombre: string;
	descripcion?: string | null;
	permisoIds: number[];
}
