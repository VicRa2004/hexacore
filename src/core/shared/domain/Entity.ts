import { EntityId } from "./EntityId";

export abstract class Entity {
  protected readonly id: EntityId;

  constructor(id?: EntityId) {
    // Si no le pasan un ID, se inicializa como "nuevo" (undefined)
    this.id = id ?? new EntityId();
  }

  public getId(): number {
    if (this.id.value === null || this.id.value === undefined) {
      throw new Error("Entity has no ID");
    }
    return this.id.value;
  }
}
