import { createFileRoute } from "@tanstack/react-router";
import { requierePermiso } from "@/core/auth/permisos";
import {
	tablaSearchSchema,
	textoSearchSchema,
} from "@/core/router/searchParams";
import { UsuariosPage } from "@/modules/usuarios/pages/UsuariosPage";

export const Route = createFileRoute("/_authenticated/usuarios")({
	beforeLoad: requierePermiso("usuarios:leer"),
	validateSearch: tablaSearchSchema({ email: textoSearchSchema }),
	component: UsuariosPage,
	staticData: { titulo: "Usuarios" },
});
