import { createFileRoute } from "@tanstack/react-router";
import { RolesPage } from "@/modules/roles/pages/RolesPage";

export const Route = createFileRoute("/_authenticated/roles")({
	component: RolesPage,
});
