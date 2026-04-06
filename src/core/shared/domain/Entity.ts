import { EntityId } from "./EntityId";

export abstract class Entity {
  protected readonly id: EntityId;

  constructor(id?: EntityId) {
    // Si no le pasan un ID, se inicializa como "nuevo" (undefined)
    this.id = id ?? new EntityId();
  }

  public getId(): EntityId {
    return this.id;
  }

  public equals(other?: Entity): boolean {
    if (other == null) return false;
    if (this === other) return true;

    // Delega la comparación lógica al Value Object del ID
    return this.id.equals(other.getId());
  }
}
