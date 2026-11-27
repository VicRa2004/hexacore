import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import type { ActualizarAjustesDto, AjustesDto } from "@/core/api/schema.gen";
import { ajustesApi, type TipoImagenAjuste } from "../api/ajustesApi";
import { ajustesKeys } from "./useAjustesQuery";

function sincronizarCaches(
	queryClient: ReturnType<typeof useQueryClient>,
	actualizado: AjustesDto,
) {
	queryClient.setQueryData(ajustesKeys.sistema(), actualizado);
	queryClient.setQueryData(ajustesKeys.publicos(), {
		nombreApp: actualizado.nombreApp,
		colorMarca: actualizado.colorMarca,
		registroPublicoAbierto: actualizado.registroPublicoAbierto,
		logoUrl: actualizado.logoUrl,
		faviconUrl: actualizado.faviconUrl,
	});
}

export function useActualizarAjustesMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (datos: ActualizarAjustesDto) => ajustesApi.actualizar(datos),
		onSuccess: (actualizado) => {
			sincronizarCaches(queryClient, actualizado);
			toast.success("Ajustes guardados");
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}

export function useImagenAjusteMutation(tipo: TipoImagenAjuste) {
	const queryClient = useQueryClient();
	const etiqueta = tipo === "logo" ? "Logo" : "Favicon";

	return useMutation({
		mutationFn: (archivo: File | null) =>
			archivo
				? ajustesApi.subirImagen(tipo, archivo)
				: ajustesApi.eliminarImagen(tipo),
		onSuccess: (actualizado, archivo) => {
			sincronizarCaches(queryClient, actualizado);
			toast.success(
				archivo ? `${etiqueta} actualizado` : `${etiqueta} quitado`,
			);
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
