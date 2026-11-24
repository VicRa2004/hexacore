import { describe, expect, it, vi } from "vitest";
import {
	agruparComandos,
	type ComandoPaleta,
	construirComandosAcciones,
	construirComandosApariencia,
	construirComandosNavegacion,
	filtrarComandos,
	normalizarTexto,
} from "./comandos";

describe("comandos de la paleta", () => {
	it("normalizarTexto elimina tildes, espacios extremos y pasa a minúsculas", () => {
		expect(normalizarTexto("  Auditoría  ")).toBe("auditoria");
		expect(normalizarTexto("Cerrar sesión")).toBe("cerrar sesion");
	});

	it("filtrarComandos ignora mayúsculas, tildes y soporta múltiples términos", () => {
		const comandos: ComandoPaleta[] = [
			{
				id: "1",
				grupo: "Navegación",
				etiqueta: "Auditoría",
				descripcion: "Administración",
				ejecutar: vi.fn(),
			},
			{
				id: "2",
				grupo: "Acciones rápidas",
				etiqueta: "Cerrar sesión",
				palabrasClave: ["logout", "salir"],
				ejecutar: vi.fn(),
			},
		];

		expect(filtrarComandos(comandos, "")).toHaveLength(2);
		expect(filtrarComandos(comandos, "auditoria").map((c) => c.id)).toEqual([
			"1",
		]);
		expect(filtrarComandos(comandos, "sesion cerrar").map((c) => c.id)).toEqual(
			["2"],
		);
		expect(filtrarComandos(comandos, "logout").map((c) => c.id)).toEqual(["2"]);
		expect(filtrarComandos(comandos, "inexistente")).toEqual([]);
	});

	it("construirComandosNavegacion filtra las secciones según los permisos del usuario", () => {
		const navegar = vi.fn();

		const sinPermisos = construirComandosNavegacion({
			puede: () => false,
			navegar,
		});
		expect(sinPermisos.map((c) => c.etiqueta)).toEqual([
			"Dashboard",
			...(import.meta.env.DEV ? ["Catálogo UI"] : []),
			"Mi perfil",
		]);

		const admin = construirComandosNavegacion({
			puede: () => true,
			navegar,
		});
		expect(admin.map((c) => c.etiqueta)).toContain("Usuarios");
		expect(admin.map((c) => c.etiqueta)).toContain("Roles");
		expect(admin.map((c) => c.etiqueta)).toContain("Auditoría");
		expect(admin.map((c) => c.etiqueta)).toContain("Mi perfil");
	});

	it("construirComandosAcciones oculta acciones de creación sin permisos y mantiene cerrar sesión", () => {
		const soloLectura = construirComandosAcciones({
			puede: (p) => p === "usuarios:leer" || p === "roles:leer",
			irACrearUsuario: vi.fn(),
			irACrearRol: vi.fn(),
			cerrarSesion: vi.fn(),
		});
		expect(soloLectura.map((c) => c.etiqueta)).toEqual(["Cerrar sesión"]);

		const soloCrearSinLeer = construirComandosAcciones({
			puede: (p) => p === "usuarios:crear" || p === "roles:crear",
			irACrearUsuario: vi.fn(),
			irACrearRol: vi.fn(),
			cerrarSesion: vi.fn(),
		});
		expect(soloCrearSinLeer.map((c) => c.etiqueta)).toEqual(["Cerrar sesión"]);

		const completo = construirComandosAcciones({
			puede: () => true,
			irACrearUsuario: vi.fn(),
			irACrearRol: vi.fn(),
			cerrarSesion: vi.fn(),
		});
		expect(completo.map((c) => c.etiqueta)).toEqual([
			"Nuevo usuario",
			"Nuevo rol",
			"Cerrar sesión",
		]);
	});

	it("construirComandosApariencia marca como activos el tema y el acento actuales", () => {
		const lista = construirComandosApariencia({
			preferenciaTema: "oscuro",
			acentoActual: "esmeralda",
			onCambiarTema: vi.fn(),
			onCambiarAcento: vi.fn(),
		});

		const oscuro = lista.find((c) => c.id === "tema-oscuro");
		const claro = lista.find((c) => c.id === "tema-claro");
		const esmeralda = lista.find((c) => c.id === "acento-esmeralda");

		expect(oscuro?.activo).toBe(true);
		expect(claro?.activo).toBe(false);
		expect(esmeralda?.activo).toBe(true);
		expect(esmeralda?.colorMuestra).toBe("oklch(58% 0.19 160)");
	});

	it("agruparComandos respeta el orden fijo de grupos y omite grupos vacíos", () => {
		const comandos: ComandoPaleta[] = [
			{ id: "a", grupo: "Apariencia", etiqueta: "Tema", ejecutar: vi.fn() },
			{ id: "n", grupo: "Navegación", etiqueta: "Inicio", ejecutar: vi.fn() },
			{ id: "u", grupo: "Usuarios", etiqueta: "Ana", ejecutar: vi.fn() },
		];

		const grupos = agruparComandos(comandos);
		expect(grupos.map((g) => g.grupo)).toEqual([
			"Navegación",
			"Usuarios",
			"Apariencia",
		]);
	});
});
