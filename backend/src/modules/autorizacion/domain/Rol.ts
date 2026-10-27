import type { Permiso } from "./Permiso";

/**
 * Entidad de dominio que representa un rol con los permisos que concede.
 * No depende de ningún framework ni de la capa de infraestructura.
 */
export class Rol {
	private constructor(
		private readonly id: number,
		private readonly nombre: string,
		private readonly descripcion: string | null,
		private readonly permisos: Permiso[],
	) {}

	static reconstituir(
		id: number,
		nombre: string,
		descripcion: string | null,
		permisos: Permiso[],
	): Rol {
		return new Rol(id, nombre, descripcion, permisos);
	}

	getId(): number {
		return this.id;
	}

	getNombre(): string {
		return this.nombre;
	}

	getDescripcion(): string | null {
		return this.descripcion;
	}

	getPermisos(): Permiso[] {
		return [...this.permisos];
	}
}
