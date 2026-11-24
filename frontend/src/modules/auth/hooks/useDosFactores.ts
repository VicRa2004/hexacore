import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { authApi } from "../api/authApi";

const onError = (error: unknown) => toast.error(getErrorMessage(error));

const DOS_FACTORES_KEY = ["auth", "2fa"] as const;

export function useDosFactoresQuery() {
	return useQuery({
		queryKey: DOS_FACTORES_KEY,
		queryFn: authApi.obtenerDosFactores,
	});
}

/** Tras cualquier cambio el estado (activo, códigos restantes) se vuelve a pedir. */
function useMutacionDosFactores<V, R>(
	mutationFn: (variables: V) => Promise<R>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn,
		onError,
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: DOS_FACTORES_KEY }),
	});
}

export const useIniciarDosFactoresMutation = () =>
	useMutation({ mutationFn: authApi.iniciarDosFactores, onError });

export const useActivarDosFactoresMutation = () =>
	useMutacionDosFactores(authApi.activarDosFactores);

export const useDesactivarDosFactoresMutation = () =>
	useMutacionDosFactores(authApi.desactivarDosFactores);

export const useRegenerarCodigosMutation = () =>
	useMutacionDosFactores(authApi.regenerarCodigos);
