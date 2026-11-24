import type { RegistroAuditoria } from "../domain/repository/AuditoriaRepository";

export const CABECERA_CSV_AUDITORIA =
	"id,ocurridoEn,evento,usuarioId,requestId,datos";

const PREFIJO_FORMULA_REGEX = /^[=+\-@\t\r]/;
const REQUIERE_COMILLAS_REGEX = /[",\n\r]/;

function aTextoCsv(valor: unknown): string {
	if (valor === null || valor === undefined) return "";
	if (valor instanceof Date) return valor.toISOString();
	if (typeof valor === "object") return JSON.stringify(valor);
	return String(valor);
}

/**
 * Escapa una celda según RFC 4180 y neutraliza la inyección de fórmulas
 * anteponiendo `'` cuando comienza por `=`, `+`, `-`, `@`, `\t` o `\r`.
 */
export function escaparCeldaCsv(valor: unknown): string {
	let texto = aTextoCsv(valor);
	if (PREFIJO_FORMULA_REGEX.test(texto)) {
		texto = `'${texto}`;
	}
	if (REQUIERE_COMILLAS_REGEX.test(texto)) {
		return `"${texto.replaceAll('"', '""')}"`;
	}
	return texto;
}

export function formatearFilaAuditoriaCsv(registro: RegistroAuditoria): string {
	return [
		escaparCeldaCsv(registro.id),
		escaparCeldaCsv(registro.ocurridoEn),
		escaparCeldaCsv(registro.evento),
		escaparCeldaCsv(registro.usuarioId),
		escaparCeldaCsv(registro.requestId),
		escaparCeldaCsv(registro.datos),
	].join(",");
}
