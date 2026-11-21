import type { PermisoDto } from "../api/rolesApi";
import { agruparPorRecurso } from "./agruparPorRecurso";

export interface FilaMatriz {
	recurso: string;
	/** Permiso por acción; `undefined` si el recurso no tiene esa acción. */
	celdas: (PermisoDto | undefined)[];
}

/** Permisos como tabla recurso × acción (columnas en orden de aparición). */
export function matrizPermisos(permisos: PermisoDto[]): {
	acciones: string[];
	filas: FilaMatriz[];
} {
	const acciones = [...new Set(permisos.map((p) => p.accion))];
	const filas = agruparPorRecurso(permisos).map(([recurso, delRecurso]) => ({
		recurso,
		celdas: acciones.map((a) => delRecurso.find((p) => p.accion === a)),
	}));
	return { acciones, filas };
}
