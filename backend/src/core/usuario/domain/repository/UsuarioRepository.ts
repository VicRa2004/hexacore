import type { Paginacion } from "@/core/shared/domain/Paginacion";
import type { Usuario } from "../Usuario";
import type { UsuarioFiltros } from "./UsuarioFiltros";

export interface UsuarioRepository {
	buscar: (filtros: UsuarioFiltros) => Promise<Paginacion<Usuario>>;
	buscarPorId: (id: number) => Promise<Usuario | null>;
	buscarPorEmail: (email: string) => Promise<Usuario | null>;

	crear: (data: Usuario) => Promise<Usuario>;
	actualizar: (data: Usuario) => Promise<Usuario>;

	eliminar: (id: number) => Promise<void>;
}
