import {
	Ellipsis,
	KeyRound,
	Pencil,
	Trash2,
	UserCheck,
	UserX,
} from "lucide-react";
import { usePermisos } from "@/core/auth/permisos";
import { useAuthStore } from "@/core/auth/store";
import type { Usuario } from "@/core/auth/types";
import { Button } from "@/core/components/ui/Button";
import { Menu, MenuOpcion, MenuSeparador } from "@/core/components/ui/Menu";

export type AccionUsuario = "permisos" | "editar" | "activo" | "eliminar";

/** Botón «Permisos» y menú «⋯» con lo que el usuario en sesión puede hacer sobre esta fila. */
export function AccionesUsuario({
	usuario,
	onAccion,
}: {
	usuario: Usuario;
	onAccion: (accion: AccionUsuario, usuario: Usuario) => void;
}) {
	const { puede } = usePermisos();
	const yo = useAuthStore((s) => s.usuario?.id) === usuario.id;
	const editar = puede("usuarios:actualizar");
	// A uno mismo no se le desactiva ni elimina (el backend también lo impide).
	const activo = editar && !yo;
	const eliminar = puede("usuarios:eliminar") && !yo;

	return (
		<div className="flex justify-end gap-1.5">
			{puede("asignaciones:leer") && (
				<Button
					variant="outline"
					size="sm"
					onClick={() => onAccion("permisos", usuario)}
				>
					<KeyRound className="h-3.5 w-3.5" />
					Permisos
				</Button>
			)}
			{(editar || eliminar) && (
				<Menu
					etiqueta={`Más acciones para ${usuario.nombre}`}
					claseDisparador="size-8 justify-center text-tinta-suave"
					className="w-52"
					disparador={<Ellipsis className="size-4" />}
				>
					{editar && (
						<MenuOpcion onClick={() => onAccion("editar", usuario)}>
							<Pencil />
							Editar
						</MenuOpcion>
					)}
					{activo && (
						<MenuOpcion onClick={() => onAccion("activo", usuario)}>
							{usuario.isActivo ? <UserX /> : <UserCheck />}
							{usuario.isActivo ? "Desactivar" : "Reactivar"}
						</MenuOpcion>
					)}
					{eliminar && (
						<>
							{editar && <MenuSeparador />}
							<MenuOpcion peligro onClick={() => onAccion("eliminar", usuario)}>
								<Trash2 />
								Eliminar
							</MenuOpcion>
						</>
					)}
				</Menu>
			)}
		</div>
	);
}
