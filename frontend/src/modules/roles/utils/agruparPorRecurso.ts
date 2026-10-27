import type { PermisoDto } from "../api/rolesApi";

/** Agrupa los permisos por recurso (`usuarios` → [crear, leer, ...]) conservando el orden. */
export function agruparPorRecurso(
	permisos: PermisoDto[],
): [string, PermisoDto[]][] {
	const grupos = new Map<string, PermisoDto[]>();
	for (const permiso of permisos) {
		grupos.set(permiso.recurso, [
			...(grupos.get(permiso.recurso) ?? []),
			permiso,
		]);
	}
	return [...grupos];
}
