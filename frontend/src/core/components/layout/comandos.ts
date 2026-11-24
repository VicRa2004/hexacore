import type { LinkProps } from "@tanstack/react-router";
import {
	LogOut,
	type LucideIcon,
	Monitor,
	Moon,
	Plus,
	Sun,
	UserPlus,
	UserRound,
} from "lucide-react";
import type { Permiso } from "@/core/auth/permisos";
import { SECCIONES } from "@/core/components/layout/Sidebar";
import { ACENTOS, type Acento, type Tema } from "@/core/tema";

export type GrupoComando =
	| "Navegación"
	| "Usuarios"
	| "Acciones rápidas"
	| "Apariencia";

const ORDEN_GRUPOS: GrupoComando[] = [
	"Navegación",
	"Usuarios",
	"Acciones rápidas",
	"Apariencia",
];

export interface ComandoPaleta {
	id: string;
	grupo: GrupoComando;
	etiqueta: string;
	descripcion?: string;
	palabrasClave?: string[];
	icono?: LucideIcon;
	colorMuestra?: string;
	avatar?: { nombre: string; src: string | null };
	activo?: boolean;
	peligro?: boolean;
	ejecutar: () => void;
}

/** Normaliza texto eliminando diacríticos y pasando a minúsculas para búsquedas tolerantes. */
export function normalizarTexto(texto: string): string {
	return texto
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.trim();
}

/** Filtra comandos exigiendo que todos los términos aparezcan en etiqueta, descripción o palabras clave. */
export function filtrarComandos(
	comandos: ComandoPaleta[],
	consulta: string,
): ComandoPaleta[] {
	const terminos = normalizarTexto(consulta).split(/\s+/).filter(Boolean);
	if (terminos.length === 0) return comandos;

	return comandos.filter((comando) => {
		const texto = normalizarTexto(
			[
				comando.etiqueta,
				comando.descripcion ?? "",
				...(comando.palabrasClave ?? []),
			].join(" "),
		);
		return terminos.every((termino) => texto.includes(termino));
	});
}

/** Agrupa los comandos según el orden fijo de categorías, omitiendo grupos vacíos. */
export function agruparComandos(
	comandos: ComandoPaleta[],
): { grupo: GrupoComando; items: ComandoPaleta[] }[] {
	const mapa = new Map<GrupoComando, ComandoPaleta[]>();
	for (const comando of comandos) {
		const lista = mapa.get(comando.grupo);
		if (lista) lista.push(comando);
		else mapa.set(comando.grupo, [comando]);
	}
	return ORDEN_GRUPOS.flatMap((grupo) => {
		const items = mapa.get(grupo);
		return items && items.length > 0 ? [{ grupo, items }] : [];
	});
}

export function construirComandosNavegacion({
	puede,
	navegar,
}: {
	puede: (permiso: Permiso) => boolean;
	navegar: (to: LinkProps["to"]) => void;
}): ComandoPaleta[] {
	const comandos: ComandoPaleta[] = [];
	for (const seccion of SECCIONES) {
		for (const enlace of seccion.enlaces) {
			if (enlace.permiso && !puede(enlace.permiso)) continue;
			comandos.push({
				id: `nav-${String(enlace.to)}`,
				grupo: "Navegación",
				etiqueta: enlace.etiqueta,
				descripcion: seccion.titulo,
				palabrasClave: ["ir", "navegar", seccion.titulo],
				icono: enlace.icono,
				ejecutar: () => navegar(enlace.to),
			});
		}
	}

	comandos.push({
		id: "nav-/perfil",
		grupo: "Navegación",
		etiqueta: "Mi perfil",
		descripcion: "Cuenta, seguridad y sesiones",
		palabrasClave: ["perfil", "cuenta", "seguridad", "2fa", "contraseña"],
		icono: UserRound,
		ejecutar: () => navegar("/perfil"),
	});

	return comandos;
}

export function construirComandosAcciones({
	puede,
	irACrearUsuario,
	irACrearRol,
	cerrarSesion,
}: {
	puede: (permiso: Permiso) => boolean;
	irACrearUsuario: () => void;
	irACrearRol: () => void;
	cerrarSesion: () => void;
}): ComandoPaleta[] {
	const acciones: ComandoPaleta[] = [];

	if (puede("usuarios:leer") && puede("usuarios:crear")) {
		acciones.push({
			id: "accion-nuevo-usuario",
			grupo: "Acciones rápidas",
			etiqueta: "Nuevo usuario",
			descripcion: "Crear una cuenta de usuario",
			palabrasClave: ["crear", "alta", "agregar", "usuario"],
			icono: UserPlus,
			ejecutar: irACrearUsuario,
		});
	}

	if (puede("roles:leer") && puede("roles:crear")) {
		acciones.push({
			id: "accion-nuevo-rol",
			grupo: "Acciones rápidas",
			etiqueta: "Nuevo rol",
			descripcion: "Crear un rol y configurar sus permisos",
			palabrasClave: ["crear", "alta", "agregar", "rol", "permisos"],
			icono: Plus,
			ejecutar: irACrearRol,
		});
	}

	acciones.push({
		id: "accion-cerrar-sesion",
		grupo: "Acciones rápidas",
		etiqueta: "Cerrar sesión",
		descripcion: "Salir de la cuenta actual",
		palabrasClave: ["salir", "logout", "desconectar"],
		icono: LogOut,
		peligro: true,
		ejecutar: cerrarSesion,
	});

	return acciones;
}

const TEMAS_OPCIONES: { valor: Tema; etiqueta: string; icono: LucideIcon }[] = [
	{ valor: "claro", etiqueta: "Tema claro", icono: Sun },
	{ valor: "oscuro", etiqueta: "Tema oscuro", icono: Moon },
	{ valor: "sistema", etiqueta: "Tema del sistema", icono: Monitor },
];

export function construirComandosApariencia({
	preferenciaTema,
	acentoActual,
	onCambiarTema,
	onCambiarAcento,
}: {
	preferenciaTema: Tema;
	acentoActual: Acento;
	onCambiarTema: (tema: Tema) => void;
	onCambiarAcento: (acento: Acento) => void;
}): ComandoPaleta[] {
	const temas: ComandoPaleta[] = TEMAS_OPCIONES.map((t) => ({
		id: `tema-${t.valor}`,
		grupo: "Apariencia",
		etiqueta: t.etiqueta,
		descripcion: "Cambiar apariencia de la interfaz",
		palabrasClave: ["tema", "apariencia", "modo", t.valor],
		icono: t.icono,
		activo: preferenciaTema === t.valor,
		ejecutar: () => onCambiarTema(t.valor),
	}));

	const acentos: ComandoPaleta[] = (Object.keys(ACENTOS) as Acento[]).map(
		(clave) => {
			const nombre = clave.charAt(0).toUpperCase() + clave.slice(1);
			return {
				id: `acento-${clave}`,
				grupo: "Apariencia",
				etiqueta: `Color de acento: ${nombre}`,
				descripcion: "Cambiar tono principal",
				palabrasClave: ["color", "acento", "marca", "tema", clave],
				colorMuestra: `oklch(58% 0.19 ${ACENTOS[clave]})`,
				activo: acentoActual === clave,
				ejecutar: () => onCambiarAcento(clave),
			};
		},
	);

	return [...temas, ...acentos];
}
