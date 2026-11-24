import { createFileRoute } from "@tanstack/react-router";
import { requierePermiso } from "@/core/auth/permisos";
import {
	tablaSearchSchema,
	textoSearchSchema,
} from "@/core/router/searchParams";
import { AuditoriaPage } from "@/modules/auditoria/pages/AuditoriaPage";

export const Route = createFileRoute("/_authenticated/auditoria")({
	beforeLoad: requierePermiso("auditoria:leer"),
	validateSearch: tablaSearchSchema({ evento: textoSearchSchema }),
	component: AuditoriaPage,
	staticData: { titulo: "Auditoría" },
});
