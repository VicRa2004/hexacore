import { describe, expect, it } from "bun:test";
import { EntityId } from "./EntityId";

describe("EntityId Value Object", () => {
	it("debería marcar como nuevo si no se proporciona valor o es undefined", () => {
		const id1 = new EntityId();
		const id2 = new EntityId(undefined);
		const id3 = new EntityId(null);

		expect(id1.isNew()).toBe(true);
		expect(id1.isPersisted()).toBe(false);
		expect(id2.isNew()).toBe(true);
		expect(id2.isPersisted()).toBe(false);
		expect(id3.isNew()).toBe(true);
		expect(id3.isPersisted()).toBe(false);
	});

	it("debería marcar como persistido si tiene un valor numérico", () => {
		const id = new EntityId(42);

		expect(id.isNew()).toBe(false);
		expect(id.isPersisted()).toBe(true);
		expect(id.value).toBe(42);
	});

	it("debería comparar correctamente la igualdad de IDs", () => {
		const id1 = new EntityId(10);
		const id2 = new EntityId(10);
		const id3 = new EntityId(20);
		const idNew1 = new EntityId();
		const idNew2 = new EntityId();

		expect(id1.equals(id2)).toBe(true);
		expect(id1.equals(id3)).toBe(false);
		expect(id1.equals(undefined)).toBe(false);
		// Dos IDs nuevos no son el mismo registro
		expect(idNew1.equals(idNew2)).toBe(false);
	});
});
