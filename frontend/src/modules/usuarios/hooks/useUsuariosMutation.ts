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
