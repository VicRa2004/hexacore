import { createFileRoute } from "@tanstack/react-router";
import { requierePermiso } from "@/core/auth/permisos";
import { AjustesPage } from "@/modules/ajustes/pages/AjustesPage";

export const Route = createFileRoute("/_authenticated/ajustes")({
	beforeLoad: requierePermiso("ajustes:leer"),
	component: AjustesPage,
	staticData: { titulo: "Ajustes" },
});
