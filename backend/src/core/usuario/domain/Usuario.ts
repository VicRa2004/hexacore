import { Entity } from "@/core/shared/domain/Entity";
import { Email } from "./value-objects/Email";
import { EntityId } from "@/core/shared/domain/EntityId";
import { UsuarioCreadoEvent } from "./event/UsuarioCreadoEvent";

export class Usuario extends Entity {
	private nombre: string;
	private email: Email;
	private passwordHash: string;
	private isActivo: boolean;
	/** Nombres de los roles asignados (tabla N-a-N `usuario_rol`). */
	private roles: string[];
	private emailVerificado: boolean;

	// El constructor es privado para forzar el uso del Factory Method
	private constructor(
		id: EntityId,
		nombre: string,
		email: Email,
		passwordHash: string,
		isActivo: boolean,
		roles: string[],
		emailVerificado: boolean,
	) {
		super(id);
		this.nombre = nombre;
		this.email = email;
		this.passwordHash = passwordHash;
		this.isActivo = isActivo;
		this.roles = roles;
		this.emailVerificado = emailVerificado;
	}

	// Crear un usuario NUEVO desde la interfaz de usuario
	public static crear(
		nombre: string,
		emailTexto: string,
		passwordHash: string,
		roles: string[] = ["USUARIO"],
	): Usuario {
		const emailVo = new Email(emailTexto);

		// Aquí el ID es undefined porque es nuevo
		const usuario = new Usuario(
			new EntityId(),
			nombre,
			emailVo,
			passwordHash,
			true,
			roles,
			false,
		);

		return usuario;
	}

	// Reconstruir un usuario EXISTENTE desde la Base de Datos (Usado por el Mapper)
	public static reconstituir(
		nombre: string,
		emailTexto: string,
		passwordHash: string,
		isActivo: boolean,
		id: number,
		roles: string[],
		emailVerificado = false,
	): Usuario {
		const entityId = new EntityId(id);
		const emailVo = new Email(emailTexto);

		return new Usuario(
			entityId,
			nombre,
			emailVo,
			passwordHash,
			isActivo,
			roles,
			emailVerificado,
		);
	}

	getNombre() {
		return this.nombre;
	}
	getEmail() {
		return this.email.value;
	}
	getPasswordHash() {
		return this.passwordHash;
	}
	getIsActivo() {
		return this.isActivo;
	}
	getRoles() {
		return [...this.roles];
	}
	getEmailVerificado() {
		return this.emailVerificado;
	}

	// Comportamiento de dominio
	public actualizar(cambios: {
		nombre?: string;
		email?: string;
		passwordHash?: string;
	}): void {
		if (cambios.nombre !== undefined) this.nombre = cambios.nombre;
		if (cambios.email !== undefined) this.email = new Email(cambios.email);
		if (cambios.passwordHash !== undefined)
			this.passwordHash = cambios.passwordHash;
	}

	public desactivar(): void {
		this.isActivo = false;
	}

	public agregarEventoCreado() {
		this.addDomainEvent(
			new UsuarioCreadoEvent({ id: this.getId(), email: this.email.value }),
		);
	}
}
