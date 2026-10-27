/**
 * Entidad de dominio que representa un permiso atómico.
 * No depende de ningún framework ni de la capa de infraestructura.
 */
export class Permiso {
	private constructor(
		private readonly id: number,
		private readonly recurso: string,
		private readonly accion: string,
	) {}

	static reconstituir(id: number, recurso: string, accion: string): Permiso {
		return new Permiso(id, recurso, accion);
	}

	getId(): number {
		return this.id;
	}

	getRecurso(): string {
		return this.recurso;
	}

	getAccion(): string {
		return this.accion;
	}

	/** Comprueba si este permiso coincide con el recurso y acción dados. */
	coincide(recurso: string, accion: string): boolean {
		return this.recurso === recurso && this.accion === accion;
	}
}
