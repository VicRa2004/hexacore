import { createFileRoute } from "@tanstack/react-router";
import { UsuariosPage } from "@/modules/usuarios/pages/UsuariosPage";

export const Route = createFileRoute("/_authenticated/usuarios")({
	component: UsuariosPage,
});
