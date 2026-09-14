/**
 * Entidad de dominio que representa un permiso atómico.
 * No depende de ningún framework ni de la capa de infraestructura.
 */
export class Permission {
  private constructor(
    private readonly id: number,
    private readonly resource: string,
    private readonly action: string,
  ) {}

  static reconstitute(id: number, resource: string, action: string): Permission {
    return new Permission(id, resource, action);
  }

  getId(): number {
    return this.id;
  }

  getResource(): string {
    return this.resource;
  }

  getAction(): string {
    return this.action;
  }

  /** Comprueba si este permiso coincide con el recurso y acción dados. */
  matches(resource: string, action: string): boolean {
    return this.resource === resource && this.action === action;
  }
}
