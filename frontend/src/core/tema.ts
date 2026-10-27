import { useSyncExternalStore } from "react";

export type Tema = "claro" | "oscuro" | "sistema";

const CLAVE = "tema";
const consultaOscuro = window.matchMedia("(prefers-color-scheme: dark)");
const oyentes = new Set<() => void>();

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
	const suscribir = (oyente: () => void) => {
		oyentes.add(oyente);
		return () => oyentes.delete(oyente);
	};
	const preferencia = useSyncExternalStore(suscribir, () => tema);
	const efectivo = useSyncExternalStore(
		suscribir,
		() => document.documentElement.dataset.tema as "claro" | "oscuro",
	);
	return { preferencia, efectivo };
}
