import { queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { AjustesPublicosDto } from "@/core/api/schema.gen";
import { aplicarColorMarcaDefecto } from "@/core/tema";
import { ajustesApi } from "../api/ajustesApi";

export const AJUSTES_PUBLICOS_DEFECTO: AjustesPublicosDto = {
	nombreApp: "Hexacore",
	colorMarca: 277,
	registroPublicoAbierto: true,
	logoUrl: null,
	faviconUrl: null,
};

export const ajustesKeys = {
	all: ["ajustes"] as const,
	publicos: () => [...ajustesKeys.all, "publicos"] as const,
	sistema: () => [...ajustesKeys.all, "sistema"] as const,
};

export const ajustesPublicosQuery = queryOptions({
	queryKey: ajustesKeys.publicos(),
	queryFn: ajustesApi.obtenerPublicos,
	staleTime: 5 * 60_000,
	retry: false,
});

export function useAjustesPublicos() {
	const { data, isLoading } = useQuery(ajustesPublicosQuery);
	return {
		ajustes: data ?? AJUSTES_PUBLICOS_DEFECTO,
		isLoading,
	};
}

export function useAjustesQuery() {
	return useQuery({
		queryKey: ajustesKeys.sistema(),
		queryFn: ajustesApi.obtener,
	});
}

function tipoMimeFavicon(url: string): string {
	const limpia = url.split("?")[0]?.toLowerCase() ?? "";
	if (limpia.endsWith(".ico")) return "image/x-icon";
	if (limpia.endsWith(".webp")) return "image/webp";
	if (limpia.endsWith(".png")) return "image/png";
	return "image/svg+xml";
}

/** Aplica título de pestaña, favicon y color de marca por defecto al documento. */
export function useAplicarAjustesPublicos() {
	const { ajustes } = useAjustesPublicos();

	useEffect(() => {
		document.title = ajustes.nombreApp;
	}, [ajustes.nombreApp]);

	useEffect(() => {
		aplicarColorMarcaDefecto(ajustes.colorMarca);
	}, [ajustes.colorMarca]);

	useEffect(() => {
		const enlace = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
		if (!enlace) return;
		const destino = ajustes.faviconUrl ?? "/vite.svg";
		enlace.href = destino;
		enlace.type = tipoMimeFavicon(destino);
	}, [ajustes.faviconUrl]);
}
