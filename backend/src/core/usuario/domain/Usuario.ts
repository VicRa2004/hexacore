import { Entity } from "@/core/shared/domain/Entity";
import { Email } from "./value-objects/Email";
import { EntityId } from "@/core/shared/domain/EntityId";
import { UsuarioActualizadoEvent } from "./event/UsuarioActualizadoEvent";
import { UsuarioCreadoEvent } from "./event/UsuarioCreadoEvent";
import { UsuarioEliminadoEvent } from "./event/UsuarioEliminadoEvent";

export class Usuario extends Entity {
	private nombre: string;
	private email: Email;
	private passwordHash: string;
	private isActivo: boolean;
	/** Nombres de los roles asignados (tabla N-a-N `usuario_rol`). */
	private roles: string[];
	private emailVerificado: boolean;
	/** Clave del archivo en el almacenamiento, o `null` sin avatar. */
	private avatar: string | null;

	// El constructor es privado para forzar el uso del Factory Method
	private constructor(
		id: EntityId,
		nombre: string,
		email: Email,
		passwordHash: string,
		isActivo: boolean,
		roles: string[],
		emailVerificado: boolean,
		avatar: string | null,
	) {
		super(id);
		this.nombre = nombre;
		this.email = email;
		this.passwordHash = passwordHash;
		this.isActivo = isActivo;
		this.roles = roles;
		this.emailVerificado = emailVerificado;
		this.avatar = avatar;
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
			null,
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
		avatar: string | null = null,
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
			avatar,
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
	getAvatar() {
		return this.avatar;
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

		const campos = Object.entries(cambios)
			.filter(([, valor]) => valor !== undefined)
			.map(([campo]) => (campo === "passwordHash" ? "password" : campo));
		if (campos.length > 0) {
			this.addDomainEvent(
				new UsuarioActualizadoEvent({ id: this.getId(), campos }),
			);
		}
	}

	public cambiarAvatar(clave: string | null): void {
		this.avatar = clave;
		this.addDomainEvent(
			new UsuarioActualizadoEvent({ id: this.getId(), campos: ["avatar"] }),
		);
	}

	public desactivar(): void {
		this.isActivo = false;
	}

	/** Borrado lógico: el repositorio lo persiste y deja de devolverlo. */
	public eliminar(): void {
		this.isActivo = false;
		this.addDomainEvent(
			new UsuarioEliminadoEvent({ id: this.getId(), email: this.email.value }),
		);
	}

	public agregarEventoCreado() {
		this.addDomainEvent(
			new UsuarioCreadoEvent({ id: this.getId(), email: this.email.value }),
		);
	}
}
