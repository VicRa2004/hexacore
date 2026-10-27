import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { useAuthStore } from "@/core/auth/store";
import { usuariosApi } from "../api/usuariosApi";

/** Sube (con archivo) o quita (con `null`) el avatar propio y refresca la sesión. */
export function useAvatarMutation() {
	const actualizarUsuario = useAuthStore((state) => state.actualizarUsuario);
	return useMutation({
		mutationFn: (archivo: File | null) =>
			archivo ? usuariosApi.subirAvatar(archivo) : usuariosApi.eliminarAvatar(),
		onSuccess: ({ avatarUrl }) => actualizarUsuario({ avatarUrl }),
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
