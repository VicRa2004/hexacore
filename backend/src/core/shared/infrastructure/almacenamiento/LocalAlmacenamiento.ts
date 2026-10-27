import { rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import type { Almacenamiento } from "@/core/shared/domain/Almacenamiento";

/** Archivos en disco bajo `directorio`. Con varias réplicas hace falta un volumen compartido o S3. */
export class LocalAlmacenamiento implements Almacenamiento {
	private readonly base: string;

	constructor(directorio: string) {
		this.base = resolve(directorio);
	}

	async guardar(clave: string, datos: Uint8Array): Promise<void> {
		await Bun.write(this.ruta(clave), datos); // crea los directorios que falten
	}

	async obtener(clave: string): Promise<Uint8Array<ArrayBuffer> | null> {
		const archivo = Bun.file(this.ruta(clave));
		return (await archivo.exists()) ? archivo.bytes() : null;
	}

	async eliminar(clave: string): Promise<void> {
		await rm(this.ruta(clave), { force: true });
	}

	/** Impide salir del directorio base con claves como `../../etc/passwd`. */
	private ruta(clave: string): string {
		const ruta = resolve(this.base, clave);
		if (!ruta.startsWith(this.base + sep)) {
			throw new Error(`Clave de almacenamiento inválida: ${clave}`);
		}
		return ruta;
	}
}
