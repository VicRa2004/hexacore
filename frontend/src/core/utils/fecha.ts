const relativo = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const absoluto = new Intl.DateTimeFormat("es", {
	dateStyle: "medium",
	timeStyle: "short",
});

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 365 * 24 * 3600],
	["month", 30 * 24 * 3600],
	["day", 24 * 3600],
	["hour", 3600],
	["minute", 60],
];

/** «hace 5 minutos», «ayer», «hace 3 meses»… (`ahora` inyectable para tests). */
export function fechaRelativa(iso: string, ahora = Date.now()): string {
	const segundos = (new Date(iso).getTime() - ahora) / 1000;
	for (const [unidad, tamano] of UNIDADES) {
		if (Math.abs(segundos) >= tamano)
			return relativo.format(Math.round(segundos / tamano), unidad);
	}
	return "ahora mismo";
}

/** «20 nov 2026, 10:30»: para el `title` o el `dateTime` junto a la relativa. */
export function fechaCompleta(iso: string): string {
	return absoluto.format(new Date(iso));
}
