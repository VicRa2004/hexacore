/** Puerto de almacenamiento de archivos por clave (`avatares/1-x.png`). Implementación en `container.ts`. */
export interface Almacenamiento {
	guardar(clave: string, datos: Uint8Array, tipo: string): Promise<void>;
	/** `null` si la clave no existe. */
	obtener(clave: string): Promise<Uint8Array<ArrayBuffer> | null>;
	/** No falla si la clave no existe. */
	eliminar(clave: string): Promise<void>;
}
