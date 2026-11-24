import { useEffect, useRef, useState } from "react";

export function normalizarBusqueda(
	valor: string | undefined,
): string | undefined {
	return valor?.trim() || undefined;
}

export function sincronizarValorDesdeUrl(
	actual: string,
	valorUrl: string | undefined,
): string {
	return normalizarBusqueda(actual) === normalizarBusqueda(valorUrl)
		? actual
		: (valorUrl ?? "");
}

/**
 * Mantiene el texto inmediato de un input de búsqueda y notifica el valor
 * normalizado tras `esperaMs` sin cambios, sincronizándose cuando `valorUrl`
 * cambia externamente (p. ej. historial Atrás/Adelante o enlaces del menú).
 */
export function useBusquedaDebounced(
	valorUrl: string | undefined,
	onConfirmar: (valor: string | undefined) => void,
	esperaMs = 300,
): [string, (nuevoValor: string) => void] {
	const [valor, setValor] = useState(valorUrl ?? "");
	const onConfirmarRef = useRef(onConfirmar);
	onConfirmarRef.current = onConfirmar;

	useEffect(() => {
		setValor((actual) => sincronizarValorDesdeUrl(actual, valorUrl));
	}, [valorUrl]);

	useEffect(() => {
		const normalizado = normalizarBusqueda(valor);
		const normalizadoUrl = normalizarBusqueda(valorUrl);
		if (normalizado === normalizadoUrl) return;

		const timer = setTimeout(() => {
			onConfirmarRef.current(normalizado);
		}, esperaMs);

		return () => clearTimeout(timer);
	}, [valor, valorUrl, esperaMs]);

	return [valor, setValor];
}
