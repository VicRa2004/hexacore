import { S3Client } from "bun";
import type { Almacenamiento } from "@/core/shared/domain/Almacenamiento";

/** S3 o compatible (Cloudflare R2, MinIO) con el cliente nativo de Bun. */
export class S3Almacenamiento implements Almacenamiento {
	constructor(private readonly cliente: S3Client) {}

	async guardar(clave: string, datos: Uint8Array, tipo: string): Promise<void> {
		await this.cliente.write(clave, datos, { type: tipo });
	}

	async obtener(clave: string): Promise<Uint8Array<ArrayBuffer> | null> {
		const archivo = this.cliente.file(clave);
		return (await archivo.exists()) ? archivo.bytes() : null;
	}

	async eliminar(clave: string): Promise<void> {
		await this.cliente.delete(clave);
	}
}
