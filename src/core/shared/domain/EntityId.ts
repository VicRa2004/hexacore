import { ValueObject } from "./ValueObject";

type IdValue = number | null | undefined;

export class EntityId extends ValueObject<IdValue> {
  constructor(value?: IdValue) {
    super(value);
  }

  // Métodos útiles de dominio para saber el estado de la entidad
  public isNew(): boolean {
    return this.value === null || this.value === undefined;
  }

  public isPersisted(): boolean {
    return !this.isNew;
  }

  // Sobrescribimos el equals para manejar la lógica de IDs temporales
  public equals(other?: EntityId): boolean {
    if (!other) return false;
    if (this.isNew() || other.isNew()) return false; // Dos IDs nuevos no son el mismo registro
    return this.value === other.value;
  }
}
