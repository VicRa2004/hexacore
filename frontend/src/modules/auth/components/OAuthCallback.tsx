import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import type { ProveedorOAuth } from "@/core/api/schema.gen";
import { useAuthStore } from "@/core/auth/store";
import { Spinner } from "@/core/components/ui/Spinner";
import { useEntrar } from "../hooks/useEntrar";
import { useCanjearOAuthMutation } from "../hooks/useOAuth";
import { NOMBRE_PROVEEDOR } from "../utils/proveedoresOAuth";
import { PasoDosFactores } from "./PasoDosFactores";

/**
 * Vuelta del login social. El backend deja en el fragmento `codigo` (se canjea por
 * la sesión), `vinculada` (desde el perfil) o `error`.
 */
export function OAuthCallback() {
	const navigate = useNavigate();
	const entrar = useEntrar();
	const canjear = useCanjearOAuthMutation();
	const [token2fa, setToken2fa] = useState<string | null>(null);
	// El código es de un solo uso: StrictMode no debe procesarlo dos veces.
	const procesado = useRef(false);

	useEffect(() => {
		if (procesado.current) return;
		procesado.current = true;

		const params = new URLSearchParams(window.location.hash.slice(1));
		// Fuera de la URL y del historial.
		window.history.replaceState(null, "", window.location.pathname);

		const fallar = (mensaje: string) => {
			toast.error(mensaje);
			const conSesion = useAuthStore.getState().isAuthenticated;
			navigate({ to: conSesion ? "/perfil" : "/login", replace: true });
		};

		const vinculada = params.get("vinculada") as ProveedorOAuth | null;
		const codigo = params.get("codigo");
		if (vinculada) {
			toast.success(
				`Cuenta de ${NOMBRE_PROVEEDOR[vinculada] ?? vinculada} vinculada`,
			);
			navigate({ to: "/perfil", replace: true });
		} else if (codigo) {
			canjear.mutate(codigo, {
				onSuccess: (respuesta) =>
					"requiere2fa" in respuesta
						? setToken2fa(respuesta.token2fa)
						: entrar(respuesta),
				onError: (error) => fallar(getErrorMessage(error)),
			});
		} else {
			fallar(params.get("error") ?? "No se pudo completar el acceso.");
		}
	}, [canjear, entrar, navigate]);

	if (token2fa) {
		return (
			<PasoDosFactores
				token2fa={token2fa}
				onEntrar={entrar}
				onVolver={() => navigate({ to: "/login" })}
			/>
		);
	}

	return (
		<div className="flex items-center justify-center gap-2 text-sm text-tinta-suave">
			<Spinner size="sm" />
			Completando el acceso…
		</div>
	);
}
