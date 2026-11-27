export type TipoImagenAjuste = "logo" | "favicon";

export interface AjustesPublicosDto {
	nombreApp: string;
	colorMarca: number;
	registroPublicoAbierto: boolean;
	logoUrl: string | null;
	faviconUrl: string | null;
}

export interface AjustesDto extends AjustesPublicosDto {
	remitenteCorreo: string;
}

export interface ActualizarAjustesDto {
	nombreApp?: string;
	colorMarca?: number;
	remitenteCorreo?: string;
	registroPublicoAbierto?: boolean;
}
