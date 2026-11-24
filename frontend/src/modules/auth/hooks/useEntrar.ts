import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuthStore } from "@/core/auth/store";
import type { AuthResponse } from "@/core/auth/types";

/** Guarda la sesión recién emitida y entra al dashboard. */
export function useEntrar() {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);

	return (response: AuthResponse) => {
		login(response);
		toast.success(`¡Bienvenido de nuevo, ${response.usuario.nombre}!`);
		navigate({ to: "/dashboard" });
	};
}
