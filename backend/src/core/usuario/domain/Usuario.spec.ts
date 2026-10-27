import { describe, expect, it } from "bun:test";
import { Usuario } from "./Usuario";
import { UsuarioCreadoEvent } from "./event/UsuarioCreadoEvent";

describe("Usuario Entity", () => {
	const datosUsuario = {
		nombre: "John Doe",
		email: "john@example.com",
		passwordHash: "hashed_password",
		roles: ["USUARIO", "MOD"],
	};

	it("debería crear un usuario nuevo correctamente usando Usuario.crear", () => {
		const usuario = Usuario.crear(
			datosUsuario.nombre,
			datosUsuario.email,
			datosUsuario.passwordHash,
			datosUsuario.roles,
		);

		expect(usuario.getNombre()).toBe(datosUsuario.nombre);
		expect(usuario.getEmail()).toBe(datosUsuario.email);
		expect(usuario.getPasswordHash()).toBe(datosUsuario.passwordHash);
		expect(usuario.getRoles()).toEqual(datosUsuario.roles);
		expect(usuario.getIsActivo()).toBe(true);
	});

	it("debería reconstituir un usuario correctamente usando Usuario.reconstituir", () => {
		const id = 123;
		const isActivo = false;
		const usuario = Usuario.reconstituir(
			datosUsuario.nombre,
			datosUsuario.email,
			datosUsuario.passwordHash,
			isActivo,
			id,
			datosUsuario.roles,
		);

		expect(usuario.getId()).toBe(id);
		expect(usuario.getNombre()).toBe(datosUsuario.nombre);
		expect(usuario.getEmail()).toBe(datosUsuario.email);
		expect(usuario.getIsActivo()).toBe(isActivo);
		expect(usuario.getRoles()).toEqual(datosUsuario.roles);
	});

	it("debería asignar el rol USUARIO por defecto al crear", () => {
		const usuario = Usuario.crear(
			datosUsuario.nombre,
			datosUsuario.email,
			datosUsuario.passwordHash,
		);
		expect(usuario.getRoles()).toEqual(["USUARIO"]);
	});

	it("debería desactivar un usuario cuando se llama a desactivar()", () => {
		const usuario = Usuario.crear(
			datosUsuario.nombre,
			datosUsuario.email,
			datosUsuario.passwordHash,
		);
		expect(usuario.getIsActivo()).toBe(true);

		usuario.desactivar();
		expect(usuario.getIsActivo()).toBe(false);
	});

	it("debería añadir un evento de creación al llamar a agregarEventoCreado()", () => {
		const id = 123;
		const isActivo = false;

		const usuario = Usuario.reconstituir(
			datosUsuario.nombre,
			datosUsuario.email,
			datosUsuario.passwordHash,
			isActivo,
			id,
			datosUsuario.roles,
		);
		usuario.agregarEventoCreado();

		const events = usuario.pullDomainEvents();
		expect(events).toHaveLength(1);
		expect(events[0]).toBeInstanceOf(UsuarioCreadoEvent);
	});
});
