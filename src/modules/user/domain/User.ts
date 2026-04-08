import { Entity } from "@/core/shared/domain/Entity";
import { Email } from "./value-objects/Email";
import { EntityId } from "@/core/shared/domain/EntityId";

export class User extends Entity {
  private name: string;
  private email: Email;
  private passwordHash: string;
  private isActive: boolean;

  // El constructor es privado para forzar el uso del Factory Method
  private constructor(
    id: EntityId,
    name: string,
    email: Email,
    passwordHash: string,
    isActive: boolean,
  ) {
    super(id);
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.isActive = isActive;
  }

  // Crear un usuario NUEVO desde la interfaz de usuario
  public static create(
    name: string,
    emailStr: string,
    passwordHash: string,
  ): User {
    const emailVO = new Email(emailStr);

    // Aquí el ID es undefined porque es nuevo
    const user = new User(new EntityId(), name, emailVO, passwordHash, true);

    // Aquí podrías agregar: user.addDomainEvent(new UserCreatedEvent(user.id))
    return user;
  }

  // Reconstruir un usuario EXISTENTE desde la Base de Datos (Usado por el Mapper)
  public static reconstitute(
    name: string,
    emailStr: string,
    passwordHash: string,
    isActive: boolean,
    id: number,
  ): User {
    const entityId = new EntityId(id);
    const emailVO = new Email(emailStr);

    return new User(entityId, name, emailVO, passwordHash, isActive);
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

  // Comportamiento de dominio
  public deactivate(): void {
    this.isActive = false;
  }
}
