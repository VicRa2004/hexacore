import { createFileRoute } from "@tanstack/react-router";
import { AuditoriaPage } from "@/modules/auditoria/pages/AuditoriaPage";

export const Route = createFileRoute("/_authenticated/auditoria")({
	component: AuditoriaPage,
	staticData: { titulo: "Auditoría" },
});
