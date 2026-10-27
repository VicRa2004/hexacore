import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { usuariosKeys } from "@/modules/usuarios/hooks/useUsuariosQuery";
import {
	type AsignacionUsuario,
	type GuardarRolInput,
	rolesApi,
} from "../api/rolesApi";
import { rolesKeys } from "./useRolesQuery";

const onError = (error: unknown) => toast.error(getErrorMessage(error));

export function useCrearRolMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: rolesApi.crearRol,
		onSuccess: (rol) => {
			toast.success(`Rol ${rol.nombre} creado`);
			return queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
		},
		onError,
	});
}

export function useActualizarRolMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, datos }: { id: number; datos: GuardarRolInput }) =>
			rolesApi.actualizarRol(id, datos),
		onSuccess: (rol) => {
			toast.success(`Rol ${rol.nombre} guardado`);
			// El nombre del rol aparece en la lista de usuarios.
			queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
			return queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
		},
		onError,
	});
}

export function useEliminarRolMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: rolesApi.eliminarRol,
		onSuccess: () => {
			toast.success("Rol eliminado");
			return queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
		},
		onError,
	});
}

export function useActualizarAsignacionMutation(usuarioId: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (asignacion: AsignacionUsuario) =>
			rolesApi.actualizarAsignacion(usuarioId, asignacion),
		onSuccess: (asignacion) => {
			toast.success("Roles y permisos guardados");
			queryClient.setQueryData(rolesKeys.asignacion(usuarioId), asignacion);
			return queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
		},
		onError,
	});
}
