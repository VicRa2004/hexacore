import { createFileRoute } from "@tanstack/react-router";
import { PerfilPage } from "@/modules/usuarios/pages/PerfilPage";

export const Route = createFileRoute("/_authenticated/perfil")({
	component: PerfilPage,
});
