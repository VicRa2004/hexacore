import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/core/auth/store";
import { authApi } from "@/modules/auth/api/authApi";

/** Cierra la sesión en el backend (si responde), limpia el store local y redirige al login. */
export function useCerrarSesion() {
	const navigate = useNavigate();
	const logout = useAuthStore((s) => s.logout);

	return useCallback(async () => {
		try {
			await authApi.logout();
		} catch {
			// Se limpia la sesión local aunque falle el servidor.
		} finally {
			logout();
			toast.info("Sesión cerrada correctamente");
			navigate({ to: "/login" });
		}
	}, [logout, navigate]);
}
