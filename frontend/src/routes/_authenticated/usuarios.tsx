import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requierePermiso } from "@/core/auth/permisos";
import {
	direccionSearchSchema,
	ordenSearchSchema,
	tablaSearchSchema,
	textoSearchSchema,
} from "@/core/router/searchParams";
import { CAMPOS_ORDEN_USUARIOS } from "@/modules/usuarios/api/usuariosApi";
import { UsuariosPage } from "@/modules/usuarios/pages/UsuariosPage";

export const Route = createFileRoute("/_authenticated/usuarios")({
	beforeLoad: requierePermiso("usuarios:leer"),
	validateSearch: tablaSearchSchema({
		email: textoSearchSchema,
		orden: ordenSearchSchema(CAMPOS_ORDEN_USUARIOS),
		direccion: direccionSearchSchema,
		accion: z.enum(["crear"]).optional().catch(undefined),
	}),
	component: UsuariosPage,
	staticData: { titulo: "Usuarios" },
});
