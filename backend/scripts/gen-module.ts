// Genera un módulo CRUD hexagonal en src/modules/<nombre> a partir de plantillas
// basadas en src/core/usuario, lo registra en src/modules.ts y añade su modelo Prisma.
// Uso: bun scripts/gen-module.ts <nombre> [--root <dir-backend>]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const rootFlag = args.indexOf("--root");
const root = resolve(
	rootFlag >= 0 ? (args[rootFlag + 1] ?? "") : join(import.meta.dir, ".."),
);
const nombre = args.find(
	(a, i) => !a.startsWith("--") && args[i - 1] !== "--root",
);

if (!nombre || !/^[a-z][a-zA-Z0-9]*$/.test(nombre)) {
	console.error(
		"Uso: pnpm gen:module <nombre>  (camelCase y en singular, p. ej. producto u ordenCompra)",
	);
	process.exit(1);
}

const moduleDir = join(root, "src/modules", nombre);
if (existsSync(moduleDir)) {
	console.error(`Ya existe ${moduleDir}`);
	process.exit(1);
}

// ── Variantes del nombre ─────────────────────────────────────────────────────
const n = nombre; // producto
const N = n[0]?.toUpperCase() + n.slice(1); // Producto
// shortcut: plural ingenuo (+s tras vocal, +es tras consonante); renombrar a mano si es irregular.
const plural = (s: string) => (/[aeiou]$/i.test(s) ? `${s}s` : `${s}es`);
const ns = plural(n); // productos
const Ns = plural(N); // Productos
const snake = n.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`); // orden_compra
const kebabs = plural(snake.replaceAll("_", "-")); // orden-compras → URL y recurso
const Repo = `${N}Repository`;

// ── Plantillas ───────────────────────────────────────────────────────────────
const files: Record<string, string> = {
	[`domain/${N}.ts`]: `import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export class ${N} extends Entity {
	private nombre: string;

	private constructor(id: EntityId, nombre: string) {
		super(id);
		this.nombre = nombre;
	}

	public static crear(nombre: string): ${N} {
		return new ${N}(new EntityId(), nombre);
	}

	public static reconstituir(id: number, nombre: string): ${N} {
		return new ${N}(new EntityId(id), nombre);
	}

	getNombre() {
		return this.nombre;
	}

	public actualizar(cambios: { nombre?: string }): void {
		if (cambios.nombre !== undefined) this.nombre = cambios.nombre;
	}
}
`,

	[`domain/error/${N}NoEncontradoError.ts`]: `import { BaseError } from "@/core/shared/domain/error/BaseError";

export class ${N}NoEncontradoError extends BaseError {
	constructor() {
		super("${N} no encontrado", 404);
	}
}
`,

	[`domain/repository/${Repo}.ts`]: `import type { Paginacion } from "@/core/shared/domain/Paginacion";
import type { ${N} } from "../${N}";

export interface ${N}Filtros {
	pagina: number;
	limite: number;
	nombre?: string;
}

export interface ${Repo} {
	buscar: (filtros: ${N}Filtros) => Promise<Paginacion<${N}>>;
	buscarPorId: (id: number) => Promise<${N} | null>;
	crear: (data: ${N}) => Promise<${N}>;
	actualizar: (data: ${N}) => Promise<${N}>;
	eliminar: (id: number) => Promise<void>;
}
`,

	[`application/dtos/${N}Dto.ts`]: `export interface ${N}Dto {
	id: number;
	nombre: string;
}
`,

	[`application/dtos/Crear${N}Dto.ts`]: `export interface Crear${N}Dto {
	nombre: string;
}
`,

	[`application/dtos/Actualizar${N}Dto.ts`]: `export interface Actualizar${N}Dto {
	nombre?: string;
}
`,

	[`application/dtos/Obtener${Ns}Dto.ts`]: `export interface Obtener${Ns}Dto {
	pagina: number;
	limite: number;
	nombre?: string;
}
`,

	[`application/mappers/${N}Mapper.ts`]: `import type { ${N} } from "../../domain/${N}";
import type { ${N}Dto } from "../dtos/${N}Dto";

export const ${N}Mapper = {
	toDto(${n}: ${N}): ${N}Dto {
		return {
			id: ${n}.getId(),
			nombre: ${n}.getNombre(),
		};
	},
};
`,

	[`application/useCases/Crear${N}UseCase.ts`]: `import type { Crear${N}Dto } from "../dtos/Crear${N}Dto";
import type { ${N}Dto } from "../dtos/${N}Dto";
import type { ${Repo} } from "../../domain/repository/${Repo}";
import { ${N} } from "../../domain/${N}";
import { ${N}Mapper } from "../mappers/${N}Mapper";

export class Crear${N}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async ejecutar(dto: Crear${N}Dto): Promise<${N}Dto> {
		const creado = await this.${n}Repository.crear(${N}.crear(dto.nombre));
		return ${N}Mapper.toDto(creado);
	}
}
`,

	[`application/useCases/Obtener${Ns}UseCase.ts`]: `import type { ${Repo} } from "../../domain/repository/${Repo}";
import type { Obtener${Ns}Dto } from "../dtos/Obtener${Ns}Dto";
import type { ${N}Dto } from "../dtos/${N}Dto";
import type { Paginacion } from "@/core/shared/domain/Paginacion";
import { ${N}Mapper } from "../mappers/${N}Mapper";

export class Obtener${Ns}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async ejecutar(dto: Obtener${Ns}Dto): Promise<Paginacion<${N}Dto>> {
		const resultado = await this.${n}Repository.buscar(dto);
		return { ...resultado, datos: resultado.datos.map(${N}Mapper.toDto) };
	}
}
`,

	[`application/useCases/Obtener${N}UseCase.ts`]: `import { ${N}NoEncontradoError } from "../../domain/error/${N}NoEncontradoError";
import type { ${Repo} } from "../../domain/repository/${Repo}";
import type { ${N}Dto } from "../dtos/${N}Dto";
import { ${N}Mapper } from "../mappers/${N}Mapper";

export class Obtener${N}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async ejecutar(id: number): Promise<${N}Dto> {
		const ${n} = await this.${n}Repository.buscarPorId(id);
		if (!${n}) {
			throw new ${N}NoEncontradoError();
		}
		return ${N}Mapper.toDto(${n});
	}
}
`,

	[`application/useCases/Actualizar${N}UseCase.ts`]: `import { ${N}NoEncontradoError } from "../../domain/error/${N}NoEncontradoError";
import type { ${Repo} } from "../../domain/repository/${Repo}";
import type { Actualizar${N}Dto } from "../dtos/Actualizar${N}Dto";
import type { ${N}Dto } from "../dtos/${N}Dto";
import { ${N}Mapper } from "../mappers/${N}Mapper";

export class Actualizar${N}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async ejecutar(id: number, dto: Actualizar${N}Dto): Promise<${N}Dto> {
		const ${n} = await this.${n}Repository.buscarPorId(id);
		if (!${n}) {
			throw new ${N}NoEncontradoError();
		}
		${n}.actualizar(dto);
		return ${N}Mapper.toDto(await this.${n}Repository.actualizar(${n}));
	}
}
`,

	[`application/useCases/Eliminar${N}UseCase.ts`]: `import { ${N}NoEncontradoError } from "../../domain/error/${N}NoEncontradoError";
import type { ${Repo} } from "../../domain/repository/${Repo}";

export class Eliminar${N}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async ejecutar(id: number): Promise<void> {
		const ${n} = await this.${n}Repository.buscarPorId(id);
		if (!${n}) {
			throw new ${N}NoEncontradoError();
		}
		await this.${n}Repository.eliminar(id);
	}
}
`,

	// ── Specs ──
	[`application/useCases/Crear${N}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { Crear${N}UseCase } from "./Crear${N}UseCase";
import { ${N} } from "../../domain/${N}";

describe("Crear${N}UseCase", () => {
	it("debería crear y devolver el DTO", async () => {
		const repo = {
			crear: mock(async (e: ${N}) => ${N}.reconstituir(1, e.getNombre())),
		};
		const useCase = new Crear${N}UseCase(repo as never);

		const result = await useCase.ejecutar({ nombre: "Ejemplo" });

		expect(repo.crear).toHaveBeenCalled();
		expect(result).toEqual({ id: 1, nombre: "Ejemplo" });
	});
});
`,

	[`application/useCases/Obtener${Ns}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { Obtener${Ns}UseCase } from "./Obtener${Ns}UseCase";
import { ${N} } from "../../domain/${N}";

describe("Obtener${Ns}UseCase", () => {
	it("debería devolver la página mapeada a DTOs", async () => {
		const repo = {
			buscar: mock(async () => ({
				datos: [${N}.reconstituir(1, "Ejemplo")],
				pagina: 1,
				totalElementos: 1,
				totalPaginas: 1,
			})),
		};
		const useCase = new Obtener${Ns}UseCase(repo as never);

		const result = await useCase.ejecutar({ pagina: 1, limite: 10 });

		expect(result.datos).toEqual([{ id: 1, nombre: "Ejemplo" }]);
		expect(result.totalElementos).toBe(1);
	});
});
`,

	[`application/useCases/Obtener${N}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { Obtener${N}UseCase } from "./Obtener${N}UseCase";
import { ${N} } from "../../domain/${N}";
import { ${N}NoEncontradoError } from "../../domain/error/${N}NoEncontradoError";

describe("Obtener${N}UseCase", () => {
	it("debería devolver el DTO si existe", async () => {
		const repo = { buscarPorId: mock(async () => ${N}.reconstituir(1, "Ejemplo")) };
		const useCase = new Obtener${N}UseCase(repo as never);

		expect(await useCase.ejecutar(1)).toEqual({ id: 1, nombre: "Ejemplo" });
	});

	it("debería lanzar ${N}NoEncontradoError si no existe", async () => {
		const repo = { buscarPorId: mock(async () => null) };
		const useCase = new Obtener${N}UseCase(repo as never);

		expect(useCase.ejecutar(999)).rejects.toThrow(${N}NoEncontradoError);
	});
});
`,

	[`application/useCases/Actualizar${N}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { Actualizar${N}UseCase } from "./Actualizar${N}UseCase";
import { ${N} } from "../../domain/${N}";
import { ${N}NoEncontradoError } from "../../domain/error/${N}NoEncontradoError";

describe("Actualizar${N}UseCase", () => {
	it("debería actualizar si existe", async () => {
		const repo = {
			buscarPorId: mock(async () => ${N}.reconstituir(1, "Viejo")),
			actualizar: mock(async (e: ${N}) => e),
		};
		const useCase = new Actualizar${N}UseCase(repo as never);

		expect(await useCase.ejecutar(1, { nombre: "Nuevo" })).toEqual({
			id: 1,
			nombre: "Nuevo",
		});
	});

	it("debería lanzar ${N}NoEncontradoError si no existe", async () => {
		const repo = { buscarPorId: mock(async () => null), actualizar: mock() };
		const useCase = new Actualizar${N}UseCase(repo as never);

		expect(useCase.ejecutar(999, { nombre: "Nuevo" })).rejects.toThrow(
			${N}NoEncontradoError,
		);
		expect(repo.actualizar).not.toHaveBeenCalled();
	});
});
`,

	[`application/useCases/Eliminar${N}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { Eliminar${N}UseCase } from "./Eliminar${N}UseCase";
import { ${N} } from "../../domain/${N}";
import { ${N}NoEncontradoError } from "../../domain/error/${N}NoEncontradoError";

describe("Eliminar${N}UseCase", () => {
	it("debería borrar si existe", async () => {
		const repo = {
			buscarPorId: mock(async () => ${N}.reconstituir(1, "Ejemplo")),
			eliminar: mock(async () => {}),
		};
		const useCase = new Eliminar${N}UseCase(repo as never);

		await useCase.ejecutar(1);

		expect(repo.eliminar).toHaveBeenCalledWith(1);
	});

	it("debería lanzar ${N}NoEncontradoError si no existe", async () => {
		const repo = { buscarPorId: mock(async () => null), eliminar: mock() };
		const useCase = new Eliminar${N}UseCase(repo as never);

		expect(useCase.ejecutar(999)).rejects.toThrow(${N}NoEncontradoError);
		expect(repo.eliminar).not.toHaveBeenCalled();
	});
});
`,

	// ── Infraestructura ──
	[`infrastructure/repository/Prisma${Repo}.ts`]: `import type { Paginacion } from "@/core/shared/domain/Paginacion";
import type {
	${N}Filtros,
	${Repo},
} from "../../domain/repository/${Repo}";
import { prisma } from "@/core/config/prisma";
import { ${N} } from "../../domain/${N}";

interface Prisma${N}Record {
	id: number;
	nombre: string;
}

export class Prisma${Repo} implements ${Repo} {
	private toDomain(raw: Prisma${N}Record): ${N} {
		return ${N}.reconstituir(raw.id, raw.nombre);
	}

	async buscar(filtros: ${N}Filtros): Promise<Paginacion<${N}>> {
		const { pagina, limite, nombre } = filtros;
		const where = {
			...(nombre && { nombre: { contains: nombre, mode: "insensitive" as const } }),
		};

		const [registros, totalElementos] = await prisma.$transaction([
			prisma.${n}.findMany({
				where,
				skip: (pagina - 1) * limite,
				take: limite,
				orderBy: { id: "asc" },
			}),
			prisma.${n}.count({ where }),
		]);

		return {
			datos: registros.map((registro) => this.toDomain(registro)),
			pagina,
			totalElementos,
			totalPaginas: Math.ceil(totalElementos / limite),
		};
	}

	async buscarPorId(id: number): Promise<${N} | null> {
		const registro = await prisma.${n}.findUnique({ where: { id } });
		return registro ? this.toDomain(registro) : null;
	}

	async crear(data: ${N}): Promise<${N}> {
		const registro = await prisma.${n}.create({
			data: { nombre: data.getNombre() },
		});
		return this.toDomain(registro);
	}

	async actualizar(data: ${N}): Promise<${N}> {
		const registro = await prisma.${n}.update({
			where: { id: data.getId() },
			data: { nombre: data.getNombre() },
		});
		return this.toDomain(registro);
	}

	async eliminar(id: number): Promise<void> {
		await prisma.${n}.delete({ where: { id } });
	}
}
`,

	[`infrastructure/http/schemas/${n}Schemas.ts`]: `import { z } from "@hono/zod-openapi";

export const crear${N}Schema = z.object({
	nombre: z.string().trim().min(1, "El nombre es obligatorio"),
});

export const actualizar${N}Schema = z.object({
	nombre: z.string().trim().min(1, "El nombre es obligatorio").optional(),
});

export const ${n}IdSchema = z.object({
	id: z.string().regex(/^\\d+$/, "El ID debe ser un número válido").transform(Number),
});

export const obtener${Ns}Schema = z.object({
	pagina: z.string().regex(/^\\d+$/).transform(Number).optional().default(1),
	limite: z.string().regex(/^\\d+$/).transform(Number).optional().default(10),
	nombre: z.string().trim().min(1).max(128).optional(),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

export const ${n}DtoSchema = z
	.object({
		id: z.number().int().openapi({ example: 1 }),
		nombre: z.string().openapi({ example: "Ejemplo" }),
	})
	.openapi("${N}Dto");

export const ${n}PaginaSchema = z.object({
	datos: z.array(${n}DtoSchema),
	pagina: z.number().int().openapi({ example: 1 }),
	totalElementos: z.number().int().openapi({ example: 10 }),
	totalPaginas: z.number().int().openapi({ example: 1 }),
});
`,

	[`infrastructure/http/controllers/${N}Controller.ts`]: `import type { Context } from "hono";
import type { Actualizar${N}UseCase } from "../../../application/useCases/Actualizar${N}UseCase";
import type { Crear${N}UseCase } from "../../../application/useCases/Crear${N}UseCase";
import type { Eliminar${N}UseCase } from "../../../application/useCases/Eliminar${N}UseCase";
import type { Obtener${N}UseCase } from "../../../application/useCases/Obtener${N}UseCase";
import type { Obtener${Ns}UseCase } from "../../../application/useCases/Obtener${Ns}UseCase";
import {
	actualizar${N}Schema,
	crear${N}Schema,
	obtener${Ns}Schema,
	${n}IdSchema,
} from "../schemas/${n}Schemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

export class ${N}Controller extends BaseController {
	// Objeto con nombres y no posicional: varios casos de uso tienen la misma forma (\`ejecutar(id)\`).
	constructor(
		private readonly useCases: {
			crear: Crear${N}UseCase;
			obtenerTodos: Obtener${Ns}UseCase;
			obtenerUno: Obtener${N}UseCase;
			actualizar: Actualizar${N}UseCase;
			eliminar: Eliminar${N}UseCase;
		},
	) {
		super();
	}

	crear = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(crear${N}Schema, await c.req.json());
			return this.created(c, await this.useCases.crear.ejecutar(dto));
		});

	obtenerTodos = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(obtener${Ns}Schema, c.req.query());
			return this.ok(c, await this.useCases.obtenerTodos.ejecutar(dto));
		});

	obtenerUno = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(${n}IdSchema, c.req.param());
			return this.ok(c, await this.useCases.obtenerUno.ejecutar(id));
		});

	actualizar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(${n}IdSchema, c.req.param());
			const dto = validate(actualizar${N}Schema, await c.req.json());
			return this.ok(c, await this.useCases.actualizar.ejecutar(id, dto));
		});

	eliminar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(${n}IdSchema, c.req.param());
			await this.useCases.eliminar.ejecutar(id);
			return c.body(null, 204);
		});
}
`,

	[`infrastructure/http/routes/${N}Router.ts`]: `import { OpenAPIHono } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";
import type { AuthMiddleware } from "@/modules/auth";
import type { PermisoGuard } from "@/core/shared/infrastructure/http/permisoGuard";
import { ${N}Controller } from "../controllers/${N}Controller";
import {
	actualizar${N}Schema,
	crear${N}Schema,
	obtener${Ns}Schema,
	${n}DtoSchema,
	${n}IdSchema,
	${n}PaginaSchema,
} from "../schemas/${n}Schemas";

const tags = ["${Ns}"];
const security = [{ bearerAuth: [] }];
const recurso = "${kebabs}";

export class ${N}Router {
	public readonly router = new OpenAPIHono();

	constructor(
		authMiddleware: AuthMiddleware,
		guard: PermisoGuard,
		controller: ${N}Controller,
	) {
		const docs = this.router.openAPIRegistry;
		this.router.use(authMiddleware.handle);

		docs.registerPath({
			method: "post",
			path: "/",
			tags,
			security,
			summary: "Crear ${n}",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: crear${N}Schema } },
				},
			},
			responses: {
				201: jsonResponse(${n}DtoSchema, "${N} creado"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses(\`\${recurso}:crear\`),
			},
		});
		this.router.post("/", guard.handle(recurso, "crear"), controller.crear);

		docs.registerPath({
			method: "get",
			path: "/",
			tags,
			security,
			summary: "Listar ${ns} (paginado)",
			request: { query: obtener${Ns}Schema },
			responses: {
				200: jsonResponse(${n}PaginaSchema, "Lista paginada"),
				400: errorResponse("Parámetros inválidos"),
				...protectedErrorResponses(\`\${recurso}:leer\`),
			},
		});
		this.router.get("/", guard.handle(recurso, "leer"), controller.obtenerTodos);

		docs.registerPath({
			method: "get",
			path: "/{id}",
			tags,
			security,
			summary: "Obtener ${n} por ID",
			request: { params: ${n}IdSchema },
			responses: {
				200: jsonResponse(${n}DtoSchema, "${N} encontrado"),
				...protectedErrorResponses(\`\${recurso}:leer\`),
				404: errorResponse("${N} no encontrado"),
			},
		});
		this.router.get("/:id", guard.handle(recurso, "leer"), controller.obtenerUno);

		docs.registerPath({
			method: "put",
			path: "/{id}",
			tags,
			security,
			summary: "Actualizar ${n}",
			request: {
				params: ${n}IdSchema,
				body: {
					required: true,
					content: { "application/json": { schema: actualizar${N}Schema } },
				},
			},
			responses: {
				200: jsonResponse(${n}DtoSchema, "${N} actualizado"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses(\`\${recurso}:actualizar\`),
				404: errorResponse("${N} no encontrado"),
			},
		});
		this.router.put("/:id", guard.handle(recurso, "actualizar"), controller.actualizar);

		docs.registerPath({
			method: "delete",
			path: "/{id}",
			tags,
			security,
			summary: "Eliminar ${n}",
			request: { params: ${n}IdSchema },
			responses: {
				204: { description: "${N} eliminado" },
				...protectedErrorResponses(\`\${recurso}:eliminar\`),
				404: errorResponse("${N} no encontrado"),
			},
		});
		this.router.delete("/:id", guard.handle(recurso, "eliminar"), controller.eliminar);
	}
}
`,

	"module.ts": `import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { Actualizar${N}UseCase } from "./application/useCases/Actualizar${N}UseCase";
import { Crear${N}UseCase } from "./application/useCases/Crear${N}UseCase";
import { Eliminar${N}UseCase } from "./application/useCases/Eliminar${N}UseCase";
import { Obtener${N}UseCase } from "./application/useCases/Obtener${N}UseCase";
import { Obtener${Ns}UseCase } from "./application/useCases/Obtener${Ns}UseCase";
import { ${N}Controller } from "./infrastructure/http/controllers/${N}Controller";
import { ${N}Router } from "./infrastructure/http/routes/${N}Router";
import { Prisma${Repo} } from "./infrastructure/repository/Prisma${Repo}";

export const ${n}Module: AppModule = {
	mount(app, container) {
		const repo = new Prisma${Repo}();
		const router = new ${N}Router(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermisoGuard),
			new ${N}Controller({
				crear: new Crear${N}UseCase(repo),
				obtenerTodos: new Obtener${Ns}UseCase(repo),
				obtenerUno: new Obtener${N}UseCase(repo),
				actualizar: new Actualizar${N}UseCase(repo),
				eliminar: new Eliminar${N}UseCase(repo),
			}),
		);
		app.route("/api/${kebabs}", router.router);
	},
};
`,
};

// ── Escritura ────────────────────────────────────────────────────────────────
for (const [path, content] of Object.entries(files)) {
	const target = join(moduleDir, path);
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, content);
}

// Registro en la lista de módulos
const modulesPath = join(root, "src/modules.ts");
let modulesSrc = readFileSync(modulesPath, "utf8");
const lastImport = modulesSrc.lastIndexOf("\nimport ");
const afterImports = modulesSrc.indexOf("\n", lastImport + 1) + 1;
modulesSrc = `${modulesSrc.slice(0, afterImports)}import { ${n}Module } from "@/modules/${n}/module";\n${modulesSrc.slice(afterImports)}`;
if (!modulesSrc.includes("\n];")) {
	console.error(`No se encontró el cierre "];" de la lista en ${modulesPath}`);
	process.exit(1);
}
modulesSrc = modulesSrc.replace("\n];", `\n\t${n}Module,\n];`);
writeFileSync(modulesPath, modulesSrc);

// Modelo Prisma mínimo
const schemaPath = join(root, "prisma/schema.prisma");
writeFileSync(
	schemaPath,
	`${readFileSync(schemaPath, "utf8").trimEnd()}

// Generado por gen:module: ajustar campos y @map a las convenciones de la tabla.
model ${N} {
  id        Int       @id @default(autoincrement())
  nombre    String    @db.VarChar(255)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime? @updatedAt @map("updated_at")

  @@map("${snake}")
}
`,
);

const run = (cmd: string[]) => {
	const { exitCode } = Bun.spawnSync(cmd, {
		cwd: root,
		stdout: "inherit",
		stderr: "inherit",
		env: {
			...process.env,
			DATABASE_URL:
				process.env.DATABASE_URL ??
				"postgresql://hexacore:cambia_esta_password@localhost:5433/hexacore_db?schema=public",
		},
	});
	if (exitCode !== 0) {
		console.error(`Falló: ${cmd.join(" ")}`);
		process.exit(1);
	}
};

// Biome ajusta el ancho de línea, que depende del largo del nombre.
const repoRoot = join(import.meta.dir, "../..");
run([
	join(repoRoot, "node_modules/.bin/biome"),
	"format",
	"--write",
	"--vcs-use-ignore-file=false",
	`--config-path=${repoRoot}`,
	moduleDir,
	modulesPath,
]);
run([join(root, "node_modules/.bin/prisma"), "generate"]);

console.log(`
Módulo ${n} creado en src/modules/${n} y registrado en src/modules.ts.
Siguientes pasos:
  1. Ajustar el modelo ${N} en prisma/schema.prisma y crear la migración: pnpm db:migrate
  2. Añadir los permisos "${kebabs}:{crear,leer,actualizar,eliminar}" en prisma/seed.ts
  3. Regenerar el contrato del frontend: pnpm gen:api
`);
