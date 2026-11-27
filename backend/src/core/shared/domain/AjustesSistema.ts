/** Valores efectivos de los ajustes editables del sistema. */
export interface ValoresAjustes {
	nombreApp: string;
	colorMarca: number;
	remitenteCorreo: string;
	registroPublicoAbierto: boolean;
	logoClave: string | null;
	faviconClave: string | null;
}

/** Contrato compartido de solo lectura con caché en memoria. Lo implementa el módulo `ajustes`. */
export interface LectorAjustes {
	obtener(): Promise<ValoresAjustes>;
	invalidar(): void;
}
