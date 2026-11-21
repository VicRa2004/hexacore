import { createFileRoute } from "@tanstack/react-router";
import { requierePermiso } from "@/core/auth/permisos";
import { RolesPage } from "@/modules/roles/pages/RolesPage";

export const Route = createFileRoute("/_authenticated/roles")({
	beforeLoad: requierePermiso("roles:leer"),
	component: RolesPage,
	staticData: { titulo: "Roles" },
});
