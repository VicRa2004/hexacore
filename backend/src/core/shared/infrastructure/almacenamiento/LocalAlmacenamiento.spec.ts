import { afterAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalAlmacenamiento } from "./LocalAlmacenamiento";

const dir = await mkdtemp(join(tmpdir(), "almacenamiento-"));
const almacenamiento = new LocalAlmacenamiento(dir);

describe("LocalAlmacenamiento", () => {
	afterAll(() => rm(dir, { recursive: true, force: true }));

	it("debería guardar, leer y eliminar un archivo en subdirectorios", async () => {
		await almacenamiento.guardar(
			"a/b.txt",
			new Uint8Array([1, 2, 3]),
			"text/plain",
		);
		expect(await almacenamiento.obtener("a/b.txt")).toEqual(
			new Uint8Array([1, 2, 3]),
		);

		await almacenamiento.eliminar("a/b.txt");
		expect(await almacenamiento.obtener("a/b.txt")).toBeNull();
	});

	it("no debería fallar al eliminar una clave inexistente", async () => {
		await almacenamiento.eliminar("no-existe.txt");
	});

	it("debería rechazar claves que salen del directorio base", async () => {
		await expect(almacenamiento.obtener("../fuera.txt")).rejects.toThrow();
	});
});
