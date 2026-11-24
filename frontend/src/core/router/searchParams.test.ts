import { describe, expect, it } from "vitest";
import {
	conFiltro,
	conOrden,
	direccionSearchSchema,
	normalizarPagina,
	ordenSearchSchema,
	paginaSearchSchema,
	tablaSearchSchema,
	textoSearchSchema,
} from "./searchParams";

describe("searchParams", () => {
	describe("paginaSearchSchema", () => {
		it("acepta enteros mayores que 1", () => {
			expect(paginaSearchSchema.parse("2")).toBe(2);
			expect(paginaSearchSchema.parse(3)).toBe(3);
		});

		it("omite la página 1 y valores ausentes", () => {
			expect(paginaSearchSchema.parse(undefined)).toBeUndefined();
			expect(paginaSearchSchema.parse(1)).toBeUndefined();
			expect(paginaSearchSchema.parse("1")).toBeUndefined();
		});

		it("cae a undefined ante valores inválidos", () => {
			expect(paginaSearchSchema.parse(0)).toBeUndefined();
			expect(paginaSearchSchema.parse(-1)).toBeUndefined();
			expect(paginaSearchSchema.parse("abc")).toBeUndefined();
			expect(paginaSearchSchema.parse("2.5")).toBeUndefined();
			expect(paginaSearchSchema.parse("")).toBeUndefined();
			expect(paginaSearchSchema.parse(null)).toBeUndefined();
		});
	});

	describe("textoSearchSchema", () => {
		it("recorta espacios y omite vacíos", () => {
			expect(textoSearchSchema.parse(undefined)).toBeUndefined();
			expect(textoSearchSchema.parse("")).toBeUndefined();
			expect(textoSearchSchema.parse("   ")).toBeUndefined();
			expect(textoSearchSchema.parse("  ana@test.com  ")).toBe("ana@test.com");
		});

		it("acepta números o booleanos del parser JSON y descarta objetos", () => {
			expect(textoSearchSchema.parse(123)).toBe("123");
			expect(textoSearchSchema.parse(true)).toBe("true");
			expect(textoSearchSchema.parse({})).toBeUndefined();
		});
	});

	describe("tablaSearchSchema", () => {
		it("funciona sin filtros adicionales", () => {
			const schema = tablaSearchSchema();
			expect(schema.parse({ pagina: "3" })).toEqual({ pagina: 3 });
			expect(schema.parse({ pagina: "invalido" })).toEqual({
				pagina: undefined,
			});
		});

		it("combina pagina con filtros personalizados sin lanzar errores", () => {
			const schema = tablaSearchSchema({ email: textoSearchSchema });
			expect(schema.parse({ pagina: 2, email: "  user@x.com " })).toEqual({
				pagina: 2,
				email: "user@x.com",
			});
			expect(schema.parse({ pagina: 0, email: { malo: true } })).toEqual({
				pagina: undefined,
				email: undefined,
			});
		});
	});

	describe("normalizarPagina", () => {
		it("devuelve undefined para página <= 1 y el número para > 1", () => {
			expect(normalizarPagina(0)).toBeUndefined();
			expect(normalizarPagina(1)).toBeUndefined();
			expect(normalizarPagina(2)).toBe(2);
			expect(normalizarPagina(5)).toBe(5);
		});
	});

	describe("conFiltro", () => {
		it("actualiza el filtro, conserva otros filtros y reinicia pagina", () => {
			expect(
				conFiltro(
					{ pagina: 3, email: "a@b.com", rol: "admin" },
					{
						email: "nuevo@b.com",
					},
				),
			).toEqual({
				pagina: undefined,
				email: "nuevo@b.com",
				rol: "admin",
			});
		});
	});

	describe("ordenSearchSchema y direccionSearchSchema", () => {
		const ordenSchema = ordenSearchSchema(["id", "email", "nombre"]);

		it("acepta campos permitidos y descarta valores fuera de lista blanca", () => {
			expect(ordenSchema.parse("email")).toBe("email");
			expect(ordenSchema.parse("password")).toBeUndefined();
			expect(ordenSchema.parse(undefined)).toBeUndefined();
			expect(ordenSchema.parse(123)).toBeUndefined();
		});

		it("acepta asc/desc y descarta valores inválidos en dirección", () => {
			expect(direccionSearchSchema.parse("asc")).toBe("asc");
			expect(direccionSearchSchema.parse("desc")).toBe("desc");
			expect(direccionSearchSchema.parse("random")).toBeUndefined();
			expect(direccionSearchSchema.parse(undefined)).toBeUndefined();
		});
	});

	describe("conOrden", () => {
		it("establece orden y dirección y reinicia la página", () => {
			expect(
				conOrden(
					{ pagina: 4, email: "a@b.com" },
					{ orden: "email", direccion: "desc" },
				),
			).toEqual({
				pagina: undefined,
				email: "a@b.com",
				orden: "email",
				direccion: "desc",
			});
		});

		it("usa asc por defecto si se omite la dirección y limpia ambos si orden es undefined", () => {
			expect(conOrden({ pagina: 2 }, { orden: "nombre" })).toEqual({
				pagina: undefined,
				orden: "nombre",
				direccion: "asc",
			});
			expect(
				conOrden(
					{ pagina: 3, orden: "nombre", direccion: "desc", email: "x" },
					undefined,
				),
			).toEqual({
				pagina: undefined,
				email: "x",
				orden: undefined,
				direccion: undefined,
			});
		});
	});
});
