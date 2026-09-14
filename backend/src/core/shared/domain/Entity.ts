import { EntityId } from "./EntityId";
import type { DomainEvent } from "./events/DomainEvent";

export abstract class Entity {
	protected readonly id: EntityId;
	private domainEvents: DomainEvent[] = [];

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

	protected addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	public pullDomainEvents(): DomainEvent[] {
		const events = this.domainEvents.slice();
		this.domainEvents = [];
		return events;
	}
}
