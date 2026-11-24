import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, Trash2, UserPlus, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePermisos } from "@/core/auth/permisos";
import { useAuthStore } from "@/core/auth/store";
import type { Usuario } from "@/core/auth/types";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Button } from "@/core/components/ui/Button";
import { ConfirmDialog } from "@/core/components/ui/ConfirmDialog";
import { Input } from "@/core/components/ui/Input";
import { useBusquedaDebounced } from "@/core/hooks/useBusquedaDebounced";
import {
	conFiltro,
	conOrden,
	normalizarPagina,
} from "@/core/router/searchParams";
import { AsignacionUsuarioPanel } from "@/modules/roles/components/AsignacionUsuarioPanel";
import type { CampoOrdenUsuarios } from "../api/usuariosApi";
import type { AccionUsuario } from "../components/AccionesUsuario";
import { UsuarioDialog } from "../components/UsuarioForm";
import { UsuariosTable } from "../components/UsuariosTable";
import {
	useCambiarActivoMutation,
	useDesactivarUsuariosEnBloqueMutation,
	useEliminarUsuarioMutation,
	useEliminarUsuariosEnBloqueMutation,
} from "../hooks/useUsuariosMutation";
import { useUsuariosQuery } from "../hooks/useUsuariosQuery";

/** Qué diálogo está abierto y sobre quién (`"nuevo"` = alta). */
type Abierto =
	| { tipo: "editar"; usuario: Usuario | "nuevo" }
	| { tipo: "permisos" | "desactivar" | "eliminar"; usuario: Usuario }
	| {
			tipo: "desactivar-lote" | "eliminar-lote";
			usuarios: Usuario[];
			limpiar: () => void;
	  }
	| null;

export function UsuariosPage() {
	const { puede } = usePermisos();
	const miId = useAuthStore((s) => s.usuario?.id);
	const search = useSearch({ from: "/_authenticated/usuarios" });
	const navigate = useNavigate({ from: "/usuarios" });
	const [emailBusqueda, setEmailBusqueda] = useBusquedaDebounced(
		search.email,
		(email) =>
			navigate({
				search: (prev) => conFiltro(prev, { email }),
				replace: true,
			}),
	);
	const [abierto, setAbierto] = useState<Abierto>(null);
	const cambiarActivo = useCambiarActivoMutation();
	const eliminar = useEliminarUsuarioMutation();
	const desactivarLote = useDesactivarUsuariosEnBloqueMutation();
	const eliminarLote = useEliminarUsuariosEnBloqueMutation();
	const cerrar = () => setAbierto(null);
	const puedeCrear = puede("usuarios:crear");

	useEffect(() => {
		if (search.accion !== "crear") return;
		if (puedeCrear) {
			setAbierto({ tipo: "editar", usuario: "nuevo" });
		}
		navigate({
			search: (prev) => ({ ...prev, accion: undefined }),
			replace: true,
		});
	}, [search.accion, puedeCrear, navigate]);

	const { data, isLoading, error } = useUsuariosQuery({
		pagina: search.pagina ?? 1,
		limite: 10,
		email: search.email,
		orden: search.orden,
		direccion: search.orden ? search.direccion : undefined,
	});

	const onAccion = useCallback(
		(accion: AccionUsuario, usuario: Usuario) => {
			if (accion === "activo" && !usuario.isActivo) {
				// Reactivar no es destructivo: sin confirmación.
				cambiarActivo.mutate({ id: usuario.id, isActivo: true });
			} else if (accion === "activo") {
				setAbierto({ tipo: "desactivar", usuario });
			} else {
				setAbierto({ tipo: accion, usuario });
			}
		},
		[cambiarActivo],
	);

	const puedeDesactivar = puede("usuarios:actualizar");
	const puedeEliminar = puede("usuarios:eliminar");
	const objetivo =
		abierto && "usuario" in abierto && abierto.usuario !== "nuevo"
			? abierto.usuario
			: null;
	const lote = abierto && "usuarios" in abierto ? abierto : null;

	return (
		<div className="space-y-6">
			<Encabezado
				titulo="Usuarios"
				descripcion="Consulta y administra los usuarios registrados en el sistema."
				acciones={
					puede("usuarios:crear") && (
						<Button
							onClick={() => setAbierto({ tipo: "editar", usuario: "nuevo" })}
						>
							<UserPlus />
							Nuevo usuario
						</Button>
					)
				}
			/>

			<div className="relative w-full sm:w-80">
				<Input
					type="search"
					aria-label="Buscar por email"
					placeholder="Buscar por email…"
					value={emailBusqueda}
					onChange={(e) => setEmailBusqueda(e.target.value)}
					className="pl-9"
				/>
				<Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-tinta-tenue" />
			</div>

			<UsuariosTable
				pagina={data}
				isLoading={isLoading}
				error={error}
				onCambioPagina={(nuevaPagina) =>
					navigate({
						search: (prev) => ({
							...prev,
							pagina: normalizarPagina(nuevaPagina),
						}),
					})
				}
				orden={{ orden: search.orden, direccion: search.direccion }}
				onCambioOrden={(nuevoOrden) =>
					navigate({
						search: (prev) =>
							conOrden(prev, {
								orden: nuevoOrden.orden as CampoOrdenUsuarios | undefined,
								direccion: nuevoOrden.direccion,
							}),
					})
				}
				seleccionable={puedeDesactivar || puedeEliminar}
				puedeSeleccionar={(u) => u.id !== miId}
				accionesEnBloque={(seleccionados, limpiar) => {
					const activos = seleccionados.filter((u) => u.isActivo);
					return (
						<>
							{puedeDesactivar && (
								<Button
									variant="outline"
									size="sm"
									disabled={activos.length === 0}
									onClick={() =>
										setAbierto({
											tipo: "desactivar-lote",
											usuarios: activos,
											limpiar,
										})
									}
								>
									<UserX className="size-3.5" />
									Desactivar ({activos.length})
								</Button>
							)}
							{puedeEliminar && (
								<Button
									variant="danger"
									size="sm"
									onClick={() =>
										setAbierto({
											tipo: "eliminar-lote",
											usuarios: seleccionados,
											limpiar,
										})
									}
								>
									<Trash2 className="size-3.5" />
									Eliminar ({seleccionados.length})
								</Button>
							)}
						</>
					);
				}}
				onAccion={onAccion}
			/>

			<UsuarioDialog
				abierto={abierto?.tipo === "editar"}
				usuario={abierto?.tipo === "editar" ? objetivo : null}
				onCerrar={cerrar}
			/>

			<AsignacionUsuarioPanel
				key={objetivo?.id}
				usuario={abierto?.tipo === "permisos" ? objetivo : null}
				onCerrar={cerrar}
			/>

			<ConfirmDialog
				abierto={abierto?.tipo === "desactivar"}
				titulo={`¿Desactivar a ${objetivo?.nombre}?`}
				mensaje="No podrá iniciar sesión ni usar la API y pierde sus permisos al momento. Puedes reactivarlo cuando quieras."
				textoConfirmar="Desactivar"
				peligroso
				isLoading={cambiarActivo.isPending}
				onCancelar={cerrar}
				onConfirmar={() =>
					objetivo &&
					cambiarActivo.mutate(
						{ id: objetivo.id, isActivo: false },
						{ onSettled: cerrar },
					)
				}
			/>

			<ConfirmDialog
				abierto={abierto?.tipo === "eliminar"}
				titulo={`¿Eliminar a ${objetivo?.nombre}?`}
				mensaje="Deja de aparecer en la aplicación y no podrá iniciar sesión. Su historial se conserva en la auditoría. Su email seguirá ocupado."
				textoConfirmar="Eliminar"
				peligroso
				isLoading={eliminar.isPending}
				onCancelar={cerrar}
				onConfirmar={() =>
					objetivo && eliminar.mutate(objetivo.id, { onSettled: cerrar })
				}
			/>

			<ConfirmDialog
				abierto={lote?.tipo === "desactivar-lote"}
				titulo={`¿Desactivar ${lote?.usuarios.length ?? 0} usuarios?`}
				mensaje="Ninguno podrá iniciar sesión ni usar la API y perderán sus permisos al momento. Puedes reactivarlos cuando quieras."
				textoConfirmar="Desactivar"
				peligroso
				isLoading={desactivarLote.isPending}
				onCancelar={cerrar}
				onConfirmar={() =>
					lote &&
					desactivarLote.mutate(
						lote.usuarios.map((u) => u.id),
						{
							onSuccess: () => lote.limpiar(),
							onSettled: cerrar,
						},
					)
				}
			/>

			<ConfirmDialog
				abierto={lote?.tipo === "eliminar-lote"}
				titulo={`¿Eliminar ${lote?.usuarios.length ?? 0} usuarios?`}
				mensaje="Dejarán de aparecer en la aplicación y no podrán iniciar sesión. Su historial se conserva en la auditoría y sus emails seguirán ocupados."
				textoConfirmar="Eliminar"
				peligroso
				isLoading={eliminarLote.isPending}
				onCancelar={cerrar}
				onConfirmar={() =>
					lote &&
					eliminarLote.mutate(
						lote.usuarios.map((u) => u.id),
						{
							onSuccess: () => lote.limpiar(),
							onSettled: cerrar,
						},
					)
				}
			/>
		</div>
	);
}
