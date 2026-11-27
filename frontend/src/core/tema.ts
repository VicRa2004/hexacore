import { useSyncExternalStore } from "react";

export type Tema = "claro" | "oscuro" | "sistema";

const CLAVE = "tema";
const consultaOscuro = window.matchMedia("(prefers-color-scheme: dark)");
const oyentes = new Set<() => void>();
const suscribir = (oyente: () => void) => {
	oyentes.add(oyente);
	return () => oyentes.delete(oyente);
};

function leer(): Tema {
	try {
		const guardado = localStorage.getItem(CLAVE);
		if (guardado === "claro" || guardado === "oscuro") return guardado;
	} catch {
		// localStorage bloqueado (modo privado): se usa el del sistema
	}
	return "sistema";
}

let tema = leer();

/** Pone `data-tema` en <html>; el script de index.html hace lo mismo antes de pintar. */
function aplicar() {
	const oscuro =
		tema === "oscuro" || (tema === "sistema" && consultaOscuro.matches);
	document.documentElement.dataset.tema = oscuro ? "oscuro" : "claro";
	for (const oyente of oyentes) oyente();
}

consultaOscuro.addEventListener("change", aplicar);

export function cambiarTema(nuevo: Tema) {
	tema = nuevo;
	try {
		if (nuevo === "sistema") localStorage.removeItem(CLAVE);
		else localStorage.setItem(CLAVE, nuevo);
	} catch {
		// sin persistencia: el cambio dura hasta recargar
	}
	aplicar();
}

/** Preferencia elegida y tema efectivo (`sistema` ya resuelto). */
export function useTema() {
	const preferencia = useSyncExternalStore(suscribir, () => tema);
	const efectivo = useSyncExternalStore(
		suscribir,
		() => document.documentElement.dataset.tema as "claro" | "oscuro",
	);
	return { preferencia, efectivo };
}

/** Tonos de marca que puede elegir el usuario (`--marca-h` de index.css). */
export const ACENTOS = {
	indigo: 277,
	violeta: 300,
	azul: 250,
	cian: 215,
	esmeralda: 160,
	rosa: 350,
} as const;
export type Acento = keyof typeof ACENTOS;

const CLAVE_ACENTO = "acento";

function leerAcento(): Acento {
	try {
		const guardado = localStorage.getItem(CLAVE_ACENTO);
		if (guardado && guardado in ACENTOS) return guardado as Acento;
	} catch {
		// sin localStorage: el de index.css
	}
	return "indigo";
}

let acento = leerAcento();

/** Cambia el tono de marca en caliente; el script de index.html lo aplica al cargar. */
export function cambiarAcento(nuevo: Acento) {
	acento = nuevo;
	document.documentElement.style.setProperty(
		"--marca-h",
		String(ACENTOS[nuevo]),
	);
	try {
		localStorage.setItem(CLAVE_ACENTO, nuevo);
	} catch {
		// sin persistencia: el cambio dura hasta recargar
	}
	for (const oyente of oyentes) oyente();
}

export function useAcento(): Acento {
	return useSyncExternalStore(suscribir, () => acento);
}

export function tieneAcentoPersonal(): boolean {
	try {
		const guardado = localStorage.getItem(CLAVE_ACENTO);
		return Boolean(guardado && guardado in ACENTOS);
	} catch {
		return false;
	}
}

/** Aplica el tono de marca configurado por defecto si el usuario no eligió uno personal. */
export function aplicarColorMarcaDefecto(tono: number): void {
	if (tieneAcentoPersonal()) return;
	const limpio = Math.max(0, Math.min(360, Math.round(tono)));
	document.documentElement.style.setProperty("--marca-h", String(limpio));
}
