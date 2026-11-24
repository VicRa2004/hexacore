import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requierePermiso } from "@/core/auth/permisos";
import { RolesPage } from "@/modules/roles/pages/RolesPage";

export const Route = createFileRoute("/_authenticated/roles")({
	beforeLoad: requierePermiso("roles:leer"),
	validateSearch: z.object({
		accion: z.enum(["crear"]).optional().catch(undefined),
	}),
	component: RolesPage,
	staticData: { titulo: "Roles" },
});
