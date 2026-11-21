import { createFileRoute } from "@tanstack/react-router";
import { requierePermiso } from "@/core/auth/permisos";
import { UsuariosPage } from "@/modules/usuarios/pages/UsuariosPage";

export const Route = createFileRoute("/_authenticated/usuarios")({
	beforeLoad: requierePermiso("usuarios:leer"),
	component: UsuariosPage,
	staticData: { titulo: "Usuarios" },
});
