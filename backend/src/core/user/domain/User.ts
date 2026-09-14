import { Entity } from "@/core/shared/domain/Entity";
import { Email } from "./value-objects/Email";
import { Role } from "./value-objects/Role";
import { EntityId } from "@/core/shared/domain/EntityId";
import { CreateUserEvent } from "./event/CreateUserEvent";

export class User extends Entity {
	private name: string;
	private email: Email;
	private passwordHash: string;
	private isActive: boolean;
	private role: Role;

	// El constructor es privado para forzar el uso del Factory Method
	private constructor(
		id: EntityId,
		name: string,
		email: Email,
		passwordHash: string,
		isActive: boolean,
		role: Role,
	) {
		super(id);
		this.name = name;
		this.email = email;
		this.passwordHash = passwordHash;
		this.isActive = isActive;
		this.role = role;
	}

	// Crear un usuario NUEVO desde la interfaz de usuario
	public static create(
		name: string,
		emailStr: string,
		passwordHash: string,
		roleStr: string = "USER",
	): User {
		const emailVO = new Email(emailStr);
		const roleVO = new Role(roleStr);

		// Aquí el ID es undefined porque es nuevo
		const user = new User(
			new EntityId(),
			name,
			emailVO,
			passwordHash,
			true,
			roleVO,
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
		roleStr: string,
	): User {
		const entityId = new EntityId(id);
		const emailVO = new Email(emailStr);
		const roleVO = new Role(roleStr);

		return new User(entityId, name, emailVO, passwordHash, isActive, roleVO);
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
	getRole() {
		return this.role.value;
	}

	// Comportamiento de dominio
	public deactivate(): void {
		this.isActive = false;
	}

	public addCreateEvent() {
		this.addDomainEvent(
			new CreateUserEvent({ id: this.getId(), email: this.email.value }),
		);
	}
}
