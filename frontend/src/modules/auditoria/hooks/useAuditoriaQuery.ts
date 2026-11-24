import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import {
	auditoriaApi,
	type FiltrosAuditoriaParams,
	type ObtenerAuditoriaParams,
} from "../api/auditoriaApi";

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

function descargarBlob(blob: Blob, nombreArchivo: string): void {
	const url = URL.createObjectURL(blob);
	try {
		const enlace = document.createElement("a");
		enlace.href = url;
		enlace.download = nombreArchivo;
		document.body.append(enlace);
		enlace.click();
		enlace.remove();
	} finally {
		URL.revokeObjectURL(url);
	}
}

export function useExportarAuditoriaMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: FiltrosAuditoriaParams) => {
			const { blob, nombreArchivo } = await auditoriaApi.exportarCsv(params);
			descargarBlob(blob, nombreArchivo);
		},
		onSuccess: () => {
			toast.success("Auditoría exportada en CSV");
			void queryClient.invalidateQueries({ queryKey: ["auditoria"] });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
}
