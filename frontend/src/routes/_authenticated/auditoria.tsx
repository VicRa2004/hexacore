import { createFileRoute } from "@tanstack/react-router";
import { requierePermiso } from "@/core/auth/permisos";
import { AuditoriaPage } from "@/modules/auditoria/pages/AuditoriaPage";

export const Route = createFileRoute("/_authenticated/auditoria")({
	beforeLoad: requierePermiso("auditoria:leer"),
	component: AuditoriaPage,
	staticData: { titulo: "Auditoría" },
});
