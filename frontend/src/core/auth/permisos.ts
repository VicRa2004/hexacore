import { queryOptions, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { apiClient } from "@/core/api/client";
import type { PermisoDto } from "@/core/api/schema.gen";
import { queryClient } from "@/core/router";

/** `"recurso:accion"`, p. ej. `"usuarios:crear"`. */
export type Permiso = `${string}:${string}`;

/**
 * Permisos efectivos del usuario en sesión. `null` = el backend no tiene el módulo
 * `autorizacion` (404): ahí cualquier autenticado puede todo, igual que en el servidor.
 */
export const misPermisosQuery = queryOptions({
	queryKey: ["auth", "permisos"],
	queryFn: async (): Promise<string[] | null> => {
		try {
			const { data } = await apiClient.get<PermisoDto[]>("/permisos/mios");
			return data.map((p) => `${p.recurso}:${p.accion}`);
		} catch (error) {
			if (isAxiosError(error) && error.response?.status === 404) return null;
			throw error;
		}
	},
	staleTime: 60_000,
});

export function tienePermiso(
	permisos: string[] | null | undefined,
	permiso: Permiso,
): boolean {
	if (permisos === null) return true;
	return permisos?.includes(permiso) ?? false;
}

/** `puede("usuarios:crear")`. Mientras carga devuelve `false` (mejor ocultar que enseñar de más). */
export function usePermisos() {
	const { data } = useQuery(misPermisosQuery);
	return { puede: (permiso: Permiso) => tienePermiso(data, permiso) };
}

/** Error de `beforeLoad` cuando falta el permiso de la ruta; lo pinta `DefaultErrorComponent`. */
export class AccesoDenegadoError extends Error {
	constructor(readonly permiso: Permiso) {
		super(`Necesitas el permiso ${permiso}`);
	}
}

/** Para el `beforeLoad` de una ruta: `beforeLoad: requierePermiso("roles:leer")`. */
export function requierePermiso(permiso: Permiso) {
	return async () => {
		const permisos = await queryClient.ensureQueryData(misPermisosQuery);
		if (!tienePermiso(permisos, permiso))
			throw new AccesoDenegadoError(permiso);
	};
}
