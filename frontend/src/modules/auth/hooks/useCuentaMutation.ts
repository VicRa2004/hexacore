import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { useAuthStore } from "@/core/auth/store";
import { authApi } from "../api/authApi";

const onError = (error: unknown) => toast.error(getErrorMessage(error));

const SESIONES_KEY = ["auth", "sesiones"] as const;

export function useRecuperarPasswordMutation() {
	return useMutation({ mutationFn: authApi.recuperarPassword, onError });
}

export function useRestablecerPasswordMutation() {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: authApi.restablecerPassword,
		onSuccess: ({ mensaje }) => {
			toast.success(mensaje);
			navigate({ to: "/login" });
		},
		onError,
	});
}

export function useVerificarEmailMutation() {
	return useMutation({
		mutationFn: authApi.verificarEmail,
		onSuccess: () => {
			// shortcut: marca la sesión abierta aunque el enlace fuera de otra cuenta; solo afecta al aviso del perfil.
			const { isAuthenticated, actualizarUsuario } = useAuthStore.getState();
			if (isAuthenticated) actualizarUsuario({ emailVerificado: true });
		},
		onError,
	});
}

export function useReenviarVerificacionMutation() {
	return useMutation({
		mutationFn: authApi.reenviarVerificacion,
		onSuccess: ({ mensaje }) => toast.success(mensaje),
		onError,
	});
}

export function useCambiarPasswordMutation() {
	const setTokens = useAuthStore((state) => state.setTokens);
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: authApi.cambiarPassword,
		onSuccess: (tokens) => {
			setTokens(tokens);
			queryClient.invalidateQueries({ queryKey: SESIONES_KEY });
			toast.success("Contraseña cambiada. Se cerraron tus otras sesiones.");
		},
		onError,
	});
}

export function useCerrarSesionesMutation() {
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);
	return useMutation({
		mutationFn: authApi.cerrarSesiones,
		onSuccess: ({ mensaje }) => {
			logout();
			toast.success(mensaje);
			navigate({ to: "/login" });
		},
		onError,
	});
}

export function useSesionesQuery() {
	return useQuery({
		queryKey: SESIONES_KEY,
		queryFn: authApi.listarSesiones,
		staleTime: 0,
	});
}

export function useCerrarSesionMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: authApi.cerrarSesion,
		onSuccess: ({ mensaje }) => toast.success(mensaje),
		onError,
		// También tras un 404: el id cambia cuando ese dispositivo renueva su sesión.
		onSettled: () => queryClient.invalidateQueries({ queryKey: SESIONES_KEY }),
	});
}
