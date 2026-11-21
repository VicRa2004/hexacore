export interface Dispositivo {
	/** «Chrome en Windows», «Safari en iPhone», «Dispositivo desconocido». */
	nombre: string;
	movil: boolean;
}

// El orden importa: Edge y Opera también dicen «Chrome»; Chrome también dice «Safari».
const NAVEGADORES: [RegExp, string][] = [
	[/Edg\//, "Edge"],
	[/OPR\/|Opera/, "Opera"],
	[/Firefox\//, "Firefox"],
	[/Chrome\/|CriOS/, "Chrome"],
	[/Safari\//, "Safari"],
];

const SISTEMAS: [RegExp, string][] = [
	[/iPhone/, "iPhone"],
	[/iPad/, "iPad"],
	[/Android/, "Android"],
	[/Windows/, "Windows"],
	[/Mac OS X|Macintosh/, "macOS"],
	[/CrOS/, "ChromeOS"],
	[/Linux/, "Linux"],
];

const buscar = (ua: string, tabla: [RegExp, string][]) =>
	tabla.find(([patron]) => patron.test(ua))?.[1];

/** Nombre legible del dispositivo de una sesión a partir de su user agent. */
export function describirDispositivo(ua: string | null): Dispositivo {
	if (!ua) return { nombre: "Dispositivo desconocido", movil: false };
	const navegador = buscar(ua, NAVEGADORES);
	const sistema = buscar(ua, SISTEMAS);
	const nombre =
		navegador && sistema
			? `${navegador} en ${sistema}`
			: (navegador ?? sistema ?? "Dispositivo desconocido");
	return { nombre, movil: /Mobi|iPhone|Android/.test(ua) };
}
