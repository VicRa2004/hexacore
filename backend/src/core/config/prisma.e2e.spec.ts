import { beforeEach, describe, expect, it } from "bun:test";
import { crearUsuario, vaciarUsuarios } from "@/test/e2e";
import { enTransaccion, prisma } from "./prisma";

const contar = () => prisma.usuario.count();

describe("enTransaccion (e2e)", () => {
	beforeEach(() => vaciarUsuarios());

	it("debería deshacer todas las escrituras del trabajo si lanza", async () => {
		await expect(
			enTransaccion(async () => {
				await crearUsuario("a@e2e.dev");
				await crearUsuario("b@e2e.dev");
				throw new Error("falla a mitad");
			}),
		).rejects.toThrow("falla a mitad");

		expect(await contar()).toBe(0);
	});

	it("debería unir transacciones anidadas y `$transaction` a la exterior", async () => {
		await expect(
			enTransaccion(async () => {
				await enTransaccion(() => crearUsuario("a@e2e.dev"));
				await prisma.$transaction([prisma.usuario.count()]);
				await prisma.$transaction(() => crearUsuario("b@e2e.dev"));
				expect(await contar()).toBe(2); // visibles dentro de la transacción
				throw new Error("rollback");
			}),
		).rejects.toThrow("rollback");

		expect(await contar()).toBe(0);
	});
});
