import type { PermisoDto } from "./PermisoDto";

/** DTO de salida que representa un rol serializable hacia HTTP. */
export interface RolDto {
	id: number;
	nombre: string;
	descripcion: string | null;
	permisos: PermisoDto[];
}
