export interface Correo {
	para: string;
	asunto: string;
	texto: string;
}

/** Puerto de envío de correo. Implementación por defecto en `container.ts`. */
export interface Mailer {
	enviar(correo: Correo): Promise<void>;
}
