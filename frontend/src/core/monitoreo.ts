import * as Sentry from "@sentry/react";
import { isAxiosError } from "axios";

const dsn = import.meta.env.VITE_SENTRY_DSN;

/**
 * Errores a Sentry o GlitchTip si se compiló con `VITE_SENTRY_DSN`; si no, no hace nada.
 * Sin datos personales ni contenido: sin breadcrumbs (clics y consola llevan texto) ni query.
 */
export function iniciarMonitoreo() {
	if (!dsn) return;
	Sentry.init({
		dsn,
		// Por el backend: los bloqueadores de anuncios cortan los envíos directos a GlitchTip.
		tunnel: "/api/monitoreo",
		environment: import.meta.env.MODE,
		beforeSend: (evento) => {
			if (evento.request)
				evento.request = { url: evento.request.url?.split("?")[0] };
			evento.user = undefined;
			evento.breadcrumbs = undefined;
			return evento;
		},
	});
}

/**
 * Error que pinta un error boundary. Los de la API no: los 5xx y los fallos de red
 * ya los reporta el cliente HTTP, y los 4xx son esperables.
 */
export function reportarError(error: unknown) {
	if (!dsn || isAxiosError(error)) return;
	Sentry.captureException(error);
}

/** 5xx (con su `requestId`, para cruzarlo con el backend) o fallo de red estando en línea. */
export function reportarErrorApi(error: unknown) {
	if (!dsn || !isAxiosError(error)) return;
	const status = error.response?.status;
	const sinRed = !error.response && navigator.onLine;
	if (!sinRed && (status === undefined || status < 500)) return;
	Sentry.withScope((scope) => {
		const requestId = (error.response?.data as { requestId?: string })
			?.requestId;
		if (requestId) scope.setTag("requestId", requestId);
		scope.setTag(
			"api",
			`${error.config?.method?.toUpperCase()} ${error.config?.url?.split("?")[0]}`,
		);
		Sentry.captureException(error);
	});
}
