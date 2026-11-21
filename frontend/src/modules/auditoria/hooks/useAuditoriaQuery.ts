import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditoriaApi, type ObtenerAuditoriaParams } from "../api/auditoriaApi";

export function useAuditoriaQuery(
	params: ObtenerAuditoriaParams = {},
	opciones: { enabled?: boolean } = {},
) {
	return useQuery({
		queryKey: ["auditoria", params],
		queryFn: () => auditoriaApi.obtener(params),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
		...opciones,
	});
}
