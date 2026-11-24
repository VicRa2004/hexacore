import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { useAuthStore } from "@/core/auth/store";
import {
	type ActualizarUsuarioInput,
	type CrearUsuarioInput,
	usuariosApi,
} from "../api/usuariosApi";
import { usuariosKeys } from "./useUsuariosQuery";

const onError = (error: unknown) => toast.error(getErrorMessage(error));

export function useCrearUsuarioMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (datos: CrearUsuarioInput) => usuariosApi.crearUsuario(datos),
		onSuccess: (usuario) => {
			toast.success(`Usuario ${usuario.nombre} creado`);
			return queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
		},
		onError,
	});
}

export function useActualizarUsuarioMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			datos,
		}: {
			id: number;
			datos: ActualizarUsuarioInput;
		}) => usuariosApi.actualizarUsuario(id, datos),
		onSuccess: (usuario) => {
			toast.success(`Usuario ${usuario.nombre} guardado`);
			// Si se edita a sí mismo, la barra y el perfil deben reflejarlo.
			const sesion = useAuthStore.getState();
			if (sesion.usuario?.id === usuario.id) {
				sesion.actualizarUsuario({
					nombre: usuario.nombre,
					email: usuario.email,
				});
			}
			return queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
		},
		onError,
	});
}

export function useCambiarActivoMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, isActivo }: { id: number; isActivo: boolean }) =>
			usuariosApi.actualizarUsuario(id, { isActivo }),
		onSuccess: (usuario) => {
			toast.success(
				usuario.isActivo
					? `${usuario.nombre} puede volver a iniciar sesión`
					: `${usuario.nombre} desactivado: ya no puede iniciar sesión`,
			);
			return queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
		},
		onError,
	});
}

export function useEliminarUsuarioMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => usuariosApi.eliminarUsuario(id),
		onSuccess: () => {
			toast.success("Usuario eliminado");
			return queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
		},
		onError,
	});
}

async function ejecutarEnBloque(
	ids: number[],
	operacion: (id: number) => Promise<unknown>,
) {
	const resultados = await Promise.allSettled(ids.map((id) => operacion(id)));
	const exitosos = resultados.filter((r) => r.status === "fulfilled").length;
	const fallidos = resultados.length - exitosos;
	return { exitosos, fallidos };
}

export function useDesactivarUsuariosEnBloqueMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) =>
			ejecutarEnBloque(ids, (id) =>
				usuariosApi.actualizarUsuario(id, { isActivo: false }),
			),
		onSuccess: ({ exitosos, fallidos }) => {
			if (fallidos === 0) {
				toast.success(
					exitosos === 1
						? "1 usuario desactivado"
						: `${exitosos} usuarios desactivados`,
				);
			} else if (exitosos > 0) {
				toast.warning(
					`${exitosos} desactivados; ${fallidos} no se pudieron desactivar`,
				);
			} else {
				toast.error("No se pudo desactivar a los usuarios seleccionados");
			}
			return queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
		},
		onError,
	});
}

export function useEliminarUsuariosEnBloqueMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) =>
			ejecutarEnBloque(ids, (id) => usuariosApi.eliminarUsuario(id)),
		onSuccess: ({ exitosos, fallidos }) => {
			if (fallidos === 0) {
				toast.success(
					exitosos === 1
						? "1 usuario eliminado"
						: `${exitosos} usuarios eliminados`,
				);
			} else if (exitosos > 0) {
				toast.warning(
					`${exitosos} eliminados; ${fallidos} no se pudieron eliminar`,
				);
			} else {
				toast.error("No se pudo eliminar a los usuarios seleccionados");
			}
			return queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
		},
		onError,
	});
}
