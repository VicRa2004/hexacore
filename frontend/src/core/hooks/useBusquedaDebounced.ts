import { useEffect, useRef, useState } from "react";

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
		setValor(valorUrl ?? "");
	}, [valorUrl]);

	useEffect(() => {
		const normalizado = valor.trim() || undefined;
		const normalizadoUrl = valorUrl?.trim() || undefined;
		if (normalizado === normalizadoUrl) return;

		const timer = setTimeout(() => {
			onConfirmarRef.current(normalizado);
		}, esperaMs);

		return () => clearTimeout(timer);
	}, [valor, valorUrl, esperaMs]);

	return [valor, setValor];
}
