import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import type { ProveedorOAuth } from "@/core/api/schema.gen";
import { authApi } from "../api/authApi";

const onError = (error: unknown) => toast.error(getErrorMessage(error));

const CUENTAS_KEY = ["auth", "oauth", "cuentas"] as const;

/** Proveedores configurados en el backend; vacío si no hay ninguno. */
export function useProveedoresOAuthQuery() {
	return useQuery({
		queryKey: ["auth", "oauth", "proveedores"],
		queryFn: authApi.proveedoresOAuth,
		staleTime: Number.POSITIVE_INFINITY,
	});
}

/** Pide la URL del proveedor y navega a ella (la vuelta llega a /oauth-callback). */
export function useIrAProveedorMutation(modo: "iniciar" | "vincular") {
	return useMutation({
		mutationFn: (proveedor: ProveedorOAuth) =>
			authApi.urlOAuth(proveedor, modo),
		onSuccess: (url) => window.location.assign(url),
		onError,
	});
}

export function useCuentasOAuthQuery() {
	return useQuery({ queryKey: CUENTAS_KEY, queryFn: authApi.cuentasOAuth });
}

export function useDesvincularOAuthMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: authApi.desvincularOAuth,
		onError,
		onSuccess: ({ mensaje }) => {
			toast.success(mensaje);
			return queryClient.invalidateQueries({ queryKey: CUENTAS_KEY });
		},
	});
}

export const useCanjearOAuthMutation = () =>
	useMutation({ mutationFn: authApi.canjearOAuth });
