import type { ValoresAjustes } from "@/core/shared/domain/AjustesSistema";
import type { AjustesDto, AjustesPublicosDto } from "../dtos/AjustesDto";

function construirUrlImagen(
	tipo: "logo" | "favicon",
	clave: string | null,
): string | null {
	return clave ? `/api/ajustes/${tipo}?v=${encodeURIComponent(clave)}` : null;
}

export const AjustesMapper = {
	toPublicosDto(valores: ValoresAjustes): AjustesPublicosDto {
		return {
			nombreApp: valores.nombreApp,
			colorMarca: valores.colorMarca,
			registroPublicoAbierto: valores.registroPublicoAbierto,
			logoUrl: construirUrlImagen("logo", valores.logoClave),
			faviconUrl: construirUrlImagen("favicon", valores.faviconClave),
		};
	},

	toDto(valores: ValoresAjustes): AjustesDto {
		return {
			...AjustesMapper.toPublicosDto(valores),
			remitenteCorreo: valores.remitenteCorreo,
		};
	},
};
