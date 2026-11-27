import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import {
	type ListarNotificacionesParams,
	notificacionesApi,
} from "../api/notificacionesApi";

export const NOTIFICACIONES_QUERY_KEY = ["notificaciones"] as const;
const INTERVALO_POLLING_MS = 30_000;

export function useNotificacionesQuery(
	params: ListarNotificacionesParams = { pagina: 1, limite: 15 },
) {
	return useQuery({
		queryKey: [...NOTIFICACIONES_QUERY_KEY, params],
		queryFn: () => notificacionesApi.listar(params),
		refetchInterval: INTERVALO_POLLING_MS,
		refetchIntervalInBackground: false,
		staleTime: 15_000,
		retry: false,
	});
}

export function useMarcarLeidaMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => notificacionesApi.marcarLeida(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: NOTIFICACIONES_QUERY_KEY,
			});
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
}

export function useMarcarTodasLeidasMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => notificacionesApi.marcarTodasLeidas(),
		onSuccess: ({ actualizadas }) => {
			void queryClient.invalidateQueries({
				queryKey: NOTIFICACIONES_QUERY_KEY,
			});
			if (actualizadas > 0) {
				toast.success("Notificaciones marcadas como leídas");
			}
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
}
