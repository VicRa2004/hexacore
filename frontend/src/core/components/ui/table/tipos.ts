import type { Key, ReactNode } from "react";

/** Dirección válida de ordenamiento en servidor. */
export type DireccionOrdenTabla = "asc" | "desc";

/** Estado controlado de ordenamiento por columna. */
export interface OrdenTabla {
	orden?: string;
	direccion?: DireccionOrdenTabla;
}

/** Metadatos adicionales adjuntos a cada columna de TanStack Table. */
export interface MetaColumnaTabla {
	className?: string;
	etiqueta?: string;
}

/** Forma de las respuestas paginadas del backend. */
export interface Pagina<T> {
	datos: T[];
	pagina: number;
	totalElementos: number;
	totalPaginas: number;
}

export interface Columna<T> {
	/** Identificador estable de la columna (necesario para orden o visibilidad si la cabecera no es texto). */
	id?: string;
	/** Nombre legible usado en el selector de columnas (por defecto toma `cabecera` si es string). */
	etiqueta?: string;
	cabecera: ReactNode;
	celda: (fila: T) => ReactNode;
	className?: string;
	/** Permite ordenar por esta columna (`true` usa `id`, o pasa el nombre del campo en el backend). */
	ordenable?: boolean | string;
	/** Permite mostrar u ocultar la columna desde el selector (`true` por defecto si tiene etiqueta). */
	ocultable?: boolean;
	/** Si `true`, inicia oculta cuando el usuario aún no tiene preferencia guardada. */
	ocultaPorDefecto?: boolean;
}

export interface TablaProps<T> {
	columnas: Columna<T>[];
	/** Lista simple o página del backend (entonces muestra la paginación). */
	datos: T[] | Pagina<T> | undefined;
	clave: (fila: T) => Key;
	onCambioPagina?: (pagina: number) => void;
	isLoading?: boolean;
	error?: unknown;
	/** Contenido cuando no hay filas; por defecto un `EmptyState` genérico. */
	vacio?: ReactNode;
	etiqueta?: string;
	/** Identificador único para persistir visibilidad de columnas en `localStorage` y mostrar el selector. */
	tablaId?: string;
	/** Orden actual controlado desde el servidor/URL. */
	orden?: OrdenTabla;
	onCambioOrden?: (orden: OrdenTabla) => void;
	/** Activa la columna de selección múltiple por fila. */
	seleccionable?: boolean;
	/** Predicado opcional para impedir seleccionar filas concretas (p. ej. el propio usuario). */
	puedeSeleccionar?: (fila: T) => boolean;
	/** Contenido de la barra contextual cuando hay filas seleccionadas. */
	accionesEnBloque?: (seleccionados: T[], limpiar: () => void) => ReactNode;
}
