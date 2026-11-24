import { createFileRoute } from "@tanstack/react-router";
import { requierePermiso } from "@/core/auth/permisos";
import {
	direccionSearchSchema,
	ordenSearchSchema,
	tablaSearchSchema,
	textoSearchSchema,
} from "@/core/router/searchParams";
import { CAMPOS_ORDEN_AUDITORIA } from "@/modules/auditoria/api/auditoriaApi";
import { AuditoriaPage } from "@/modules/auditoria/pages/AuditoriaPage";

export const Route = createFileRoute("/_authenticated/auditoria")({
	beforeLoad: requierePermiso("auditoria:leer"),
	validateSearch: tablaSearchSchema({
		evento: textoSearchSchema,
		orden: ordenSearchSchema(CAMPOS_ORDEN_AUDITORIA),
		direccion: direccionSearchSchema,
	}),
	component: AuditoriaPage,
	staticData: { titulo: "Auditoría" },
});
