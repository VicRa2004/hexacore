import crypto from "node:crypto";

/** TOTP (RFC 6238) con los parámetros que entienden todas las apps: SHA-1, 6 dígitos, 30 s. */
const PERIODO_MS = 30_000;
const DIGITOS = 6;
/** Pasos de tolerancia a cada lado por desfase de reloj del móvil. */
const VENTANA = 1;

const ALFABETO_BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function aBase32(bytes: Buffer): string {
	let bits = "";
	for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
	let salida = "";
	for (let i = 0; i < bits.length; i += 5) {
		salida +=
			ALFABETO_BASE32[Number.parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
	}
	return salida;
}

function deBase32(texto: string): Buffer {
	let bits = "";
	for (const caracter of texto.replace(/=+$/, "").toUpperCase()) {
		const valor = ALFABETO_BASE32.indexOf(caracter);
		if (valor < 0) throw new Error("Secreto TOTP no es base32");
		bits += valor.toString(2).padStart(5, "0");
	}
	const bytes: number[] = [];
	for (let i = 0; i + 8 <= bits.length; i += 8) {
		bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
	}
	return Buffer.from(bytes);
}

/** HOTP (RFC 4226) del contador dado. */
function generarCodigoHotp(clave: Buffer, contador: number): string {
	const mensaje = Buffer.alloc(8);
	mensaje.writeBigUInt64BE(BigInt(contador));
	const hmac = crypto.createHmac("sha1", clave).update(mensaje).digest();
	const desplazamiento = (hmac.at(-1) ?? 0) & 0x0f;
	const numero = hmac.readUInt32BE(desplazamiento) & 0x7fffffff;
	return String(numero % 10 ** DIGITOS).padStart(DIGITOS, "0");
}

/** Código TOTP del instante dado (lo que mostraría la app). */
export function generarCodigoTotp(secreto: string, ahora = Date.now()): string {
	return generarCodigoHotp(deBase32(secreto), Math.floor(ahora / PERIODO_MS));
}

/** Secreto nuevo de 160 bits en base32 (lo que se teclea o va en el QR). */
export function generarSecretoTotp(): string {
	return aBase32(crypto.randomBytes(20));
}

export function uriOtpauth(secreto: string, cuenta: string, emisor: string) {
	const etiqueta = encodeURIComponent(`${emisor}:${cuenta}`);
	const parametros = new URLSearchParams({
		secret: secreto,
		issuer: emisor,
		algorithm: "SHA1",
		digits: String(DIGITOS),
		period: String(PERIODO_MS / 1000),
	});
	return `otpauth://totp/${etiqueta}?${parametros}`;
}

/**
 * Comprueba un código contra el paso actual ± `VENTANA`.
 * @returns el paso que coincide (para impedir reutilizarlo) o `null`.
 */
export function verificarCodigoTotp(
	secreto: string,
	codigo: string,
	ahora = Date.now(),
): number | null {
	if (!/^\d{6}$/.test(codigo)) return null;
	const pasoActual = Math.floor(ahora / PERIODO_MS);
	for (let d = -VENTANA; d <= VENTANA; d++) {
		const esperado = generarCodigoTotp(secreto, ahora + d * PERIODO_MS);
		if (crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(codigo))) {
			return pasoActual + d;
		}
	}
	return null;
}

/** Normaliza lo que teclea el usuario: sin espacios ni guiones y en mayúsculas. */
export const normalizarCodigo = (codigo: string) =>
	codigo.replace(/[\s-]/g, "").toUpperCase();

/** 10 códigos de recuperación `XXXXX-XXXXX` (50 bits cada uno). */
export function generarCodigosRecuperacion(cantidad = 10): string[] {
	return Array.from({ length: cantidad }, () => {
		const codigo = aBase32(crypto.randomBytes(7)).slice(0, 10);
		return `${codigo.slice(0, 5)}-${codigo.slice(5)}`;
	});
}

export const hashearCodigoRecuperacion = (codigo: string) =>
	crypto.createHash("sha256").update(normalizarCodigo(codigo)).digest("hex");
