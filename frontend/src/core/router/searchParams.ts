import { z } from "zod";

/** Valida `pagina` (>= 1) en la URL y omite la página 1 para mantener URLs limpias. */
export const paginaSearchSchema = z.coerce
	.number()
	.int()
	.min(1)
	.transform((n) => (n <= 1 ? undefined : n))
	.optional()
	.catch(undefined);

/** Normaliza filtros de texto en la URL (el parser de TanStack Router puede pasar números o booleanos). */
export const textoSearchSchema = z
	.union([z.string(), z.number(), z.boolean()])
	.transform((v) => String(v).trim() || undefined)
	.optional()
	.catch(undefined);

/** Valida un entero positivo en la URL (p. ej. `usuarioId`). */
export const enteroPositivoSearchSchema = z.coerce
	.number()
	.int()
	.min(1)
	.optional()
	.catch(undefined);

const FECHA_ISO_CORTA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Valida una fecha real de calendario `YYYY-MM-DD` en la URL. */
export const fechaSearchSchema = z
	.string()
	.trim()
	.refine((v) => {
		if (!FECHA_ISO_CORTA_REGEX.test(v)) return false;
		const d = new Date(`${v}T00:00:00.000Z`);
		return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
	})
	.optional()
	.catch(undefined);

/** Dirección válida de ordenamiento por columna. */
export type DireccionOrden = "asc" | "desc";

/** Estado de ordenamiento sincronizable con la URL. */
export interface EstadoOrden<T extends string = string> {
	orden?: T;
	direccion?: DireccionOrden;
}

/** Valida `direccion` (`asc` | `desc`) en la URL. */
export const direccionSearchSchema = z
	.enum(["asc", "desc"])
	.optional()
	.catch(undefined);

/** Valida `orden` contra una lista blanca de campos permitidos por la API. */
export function ordenSearchSchema<
	const T extends readonly [string, ...string[]],
>(campos: T) {
	return z.enum(campos).optional().catch(undefined);
}

/** Construye un schema de `validateSearch` con `pagina` y los filtros de la tabla. */
export function tablaSearchSchema(): z.ZodObject<{
	pagina: typeof paginaSearchSchema;
}>;
export function tablaSearchSchema<T extends z.ZodRawShape>(
	filtros: T,
): z.ZodObject<{ pagina: typeof paginaSearchSchema } & T>;
export function tablaSearchSchema<T extends z.ZodRawShape>(filtros?: T) {
	return z.object({
		pagina: paginaSearchSchema,
		...filtros,
	});
}

/** Convierte página 1 (o menor) en `undefined` para no mostrar `?pagina=1` en la URL. */
export function normalizarPagina(pagina: number): number | undefined {
	return pagina > 1 ? pagina : undefined;
}

/** Actualiza filtros de búsqueda reiniciando siempre la paginación a la página 1. */
export function conFiltro<T extends { pagina?: number }>(
	prev: T,
	cambios: Partial<Omit<T, "pagina">>,
): T {
	return { ...prev, ...cambios, pagina: undefined };
}

/** Actualiza el orden de columna reiniciando la paginación a la página 1. */
export function conOrden<
	T extends { pagina?: number; orden?: C; direccion?: DireccionOrden },
	C extends string,
>(prev: T, estado: EstadoOrden<C> | undefined): T {
	if (!estado?.orden) {
		return {
			...prev,
			orden: undefined,
			direccion: undefined,
			pagina: undefined,
		};
	}
	return {
		...prev,
		orden: estado.orden,
		direccion: estado.direccion ?? "asc",
		pagina: undefined,
	};
}
