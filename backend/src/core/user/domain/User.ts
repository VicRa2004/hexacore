import { Entity } from "@/core/shared/domain/Entity";
import { Email } from "./value-objects/Email";
import { EntityId } from "@/core/shared/domain/EntityId";
import { CreateUserEvent } from "./event/CreateUserEvent";

export class User extends Entity {
	private name: string;
	private email: Email;
	private passwordHash: string;
	private isActive: boolean;
	/** Nombres de los roles asignados (tabla N-a-N `user_role`). */
	private roles: string[];

	// El constructor es privado para forzar el uso del Factory Method
	private constructor(
		id: EntityId,
		name: string,
		email: Email,
		passwordHash: string,
		isActive: boolean,
		roles: string[],
	) {
		super(id);
		this.name = name;
		this.email = email;
		this.passwordHash = passwordHash;
		this.isActive = isActive;
		this.roles = roles;
	}

	// Crear un usuario NUEVO desde la interfaz de usuario
	public static create(
		name: string,
		emailStr: string,
		passwordHash: string,
		roles: string[] = ["USER"],
	): User {
		const emailVO = new Email(emailStr);

		// Aquí el ID es undefined porque es nuevo
		const user = new User(
			new EntityId(),
			name,
			emailVO,
			passwordHash,
			true,
			roles,
		);

		return user;
	}

	// Reconstruir un usuario EXISTENTE desde la Base de Datos (Usado por el Mapper)
	public static reconstitute(
		name: string,
		emailStr: string,
		passwordHash: string,
		isActive: boolean,
		id: number,
		roles: string[],
	): User {
		const entityId = new EntityId(id);
		const emailVO = new Email(emailStr);

		return new User(entityId, name, emailVO, passwordHash, isActive, roles);
	}

	getName() {
		return this.name;
	}
	getEmail() {
		return this.email.value;
	}
	getPasswordHash() {
		return this.passwordHash;
	}
	getIsActive() {
		return this.isActive;
	}
	getRoles() {
		return [...this.roles];
	}

	// Comportamiento de dominio
	public update(changes: {
		name?: string;
		email?: string;
		passwordHash?: string;
	}): void {
		if (changes.name !== undefined) this.name = changes.name;
		if (changes.email !== undefined) this.email = new Email(changes.email);
		if (changes.passwordHash !== undefined)
			this.passwordHash = changes.passwordHash;
	}

	public deactivate(): void {
		this.isActive = false;
	}

	public addCreateEvent() {
		this.addDomainEvent(
			new CreateUserEvent({ id: this.getId(), email: this.email.value }),
		);
	}
}
