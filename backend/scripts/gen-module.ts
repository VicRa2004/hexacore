// Genera un módulo CRUD hexagonal en src/modules/<nombre> a partir de plantillas
// basadas en src/core/user, lo registra en src/modules.ts y añade su modelo Prisma.
// Uso: bun scripts/gen-module.ts <nombre> [--root <dir-backend>]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const rootFlag = args.indexOf("--root");
const root = resolve(
	rootFlag >= 0 ? (args[rootFlag + 1] ?? "") : join(import.meta.dir, ".."),
);
const name = args.find(
	(a, i) => !a.startsWith("--") && args[i - 1] !== "--root",
);

if (!name || !/^[a-z][a-zA-Z0-9]*$/.test(name)) {
	console.error(
		"Uso: pnpm gen:module <nombre>  (camelCase y en singular, p. ej. producto u ordenCompra)",
	);
	process.exit(1);
}

const moduleDir = join(root, "src/modules", name);
if (existsSync(moduleDir)) {
	console.error(`Ya existe ${moduleDir}`);
	process.exit(1);
}

// ── Variantes del nombre ─────────────────────────────────────────────────────
const n = name; // producto
const N = n[0]?.toUpperCase() + n.slice(1); // Producto
// shortcut: plural ingenuo (+s); renombrar a mano si el plural es irregular.
const ns = `${n}s`; // productos
const Ns = `${N}s`; // Productos
const snake = n.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`); // orden_compra
const kebabs = `${snake.replaceAll("_", "-")}s`; // ordenes-compra → URL y recurso
const Repo = `${N}Repository`;

// ── Plantillas ───────────────────────────────────────────────────────────────
const files: Record<string, string> = {
	[`domain/${N}.ts`]: `import { Entity } from "@/core/shared/domain/Entity";
import { EntityId } from "@/core/shared/domain/EntityId";

export class ${N} extends Entity {
	private name: string;

	private constructor(id: EntityId, name: string) {
		super(id);
		this.name = name;
	}

	public static create(name: string): ${N} {
		return new ${N}(new EntityId(), name);
	}

	public static reconstitute(id: number, name: string): ${N} {
		return new ${N}(new EntityId(id), name);
	}

	getName() {
		return this.name;
	}

	public update(changes: { name?: string }): void {
		if (changes.name !== undefined) this.name = changes.name;
	}
}
`,

	[`domain/error/${N}NotFoundError.ts`]: `import { BaseError } from "@/core/shared/domain/error/BaseError";

export class ${N}NotFoundError extends BaseError {
	constructor() {
		super("${N} not found", 404);
	}
}
`,

	[`domain/repository/${Repo}.ts`]: `import type { Pagination } from "@/core/shared/domain/Pagination";
import type { ${N} } from "../${N}";

export interface ${N}Filters {
	page: number;
	limit: number;
	name?: string;
}

export interface ${Repo} {
	find: (filters: ${N}Filters) => Promise<Pagination<${N}>>;
	findById: (id: number) => Promise<${N} | null>;
	create: (data: ${N}) => Promise<${N}>;
	update: (data: ${N}) => Promise<${N}>;
	delete: (id: number) => Promise<void>;
}
`,

	[`application/dtos/${N}Dto.ts`]: `export interface ${N}Dto {
	id: number;
	name: string;
}
`,

	[`application/dtos/Create${N}Dto.ts`]: `export interface Create${N}Dto {
	name: string;
}
`,

	[`application/dtos/Update${N}Dto.ts`]: `export interface Update${N}Dto {
	name?: string;
}
`,

	[`application/dtos/GetAll${Ns}Dto.ts`]: `export interface GetAll${Ns}Dto {
	page: number;
	limit: number;
	name?: string;
}
`,

	[`application/mappers/${N}Mapper.ts`]: `import type { ${N} } from "../../domain/${N}";
import type { ${N}Dto } from "../dtos/${N}Dto";

export const ${N}Mapper = {
	toDto(${n}: ${N}): ${N}Dto {
		return {
			id: ${n}.getId(),
			name: ${n}.getName(),
		};
	},
};
`,

	[`application/useCases/Create${N}UseCase.ts`]: `import type { Create${N}Dto } from "../dtos/Create${N}Dto";
import type { ${N}Dto } from "../dtos/${N}Dto";
import type { ${Repo} } from "../../domain/repository/${Repo}";
import { ${N} } from "../../domain/${N}";
import { ${N}Mapper } from "../mappers/${N}Mapper";

export class Create${N}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async run(dto: Create${N}Dto): Promise<${N}Dto> {
		const created = await this.${n}Repository.create(${N}.create(dto.name));
		return ${N}Mapper.toDto(created);
	}
}
`,

	[`application/useCases/GetAll${Ns}UseCase.ts`]: `import type { ${Repo} } from "../../domain/repository/${Repo}";
import type { GetAll${Ns}Dto } from "../dtos/GetAll${Ns}Dto";
import type { ${N}Dto } from "../dtos/${N}Dto";
import type { Pagination } from "@/core/shared/domain/Pagination";
import { ${N}Mapper } from "../mappers/${N}Mapper";

export class GetAll${Ns}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async run(dto: GetAll${Ns}Dto): Promise<Pagination<${N}Dto>> {
		const result = await this.${n}Repository.find(dto);
		return { ...result, data: result.data.map(${N}Mapper.toDto) };
	}
}
`,

	[`application/useCases/GetOne${N}UseCase.ts`]: `import { ${N}NotFoundError } from "../../domain/error/${N}NotFoundError";
import type { ${Repo} } from "../../domain/repository/${Repo}";
import type { ${N}Dto } from "../dtos/${N}Dto";
import { ${N}Mapper } from "../mappers/${N}Mapper";

export class GetOne${N}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async run(id: number): Promise<${N}Dto> {
		const ${n} = await this.${n}Repository.findById(id);
		if (!${n}) {
			throw new ${N}NotFoundError();
		}
		return ${N}Mapper.toDto(${n});
	}
}
`,

	[`application/useCases/Update${N}UseCase.ts`]: `import { ${N}NotFoundError } from "../../domain/error/${N}NotFoundError";
import type { ${Repo} } from "../../domain/repository/${Repo}";
import type { Update${N}Dto } from "../dtos/Update${N}Dto";
import type { ${N}Dto } from "../dtos/${N}Dto";
import { ${N}Mapper } from "../mappers/${N}Mapper";

export class Update${N}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async run(id: number, dto: Update${N}Dto): Promise<${N}Dto> {
		const ${n} = await this.${n}Repository.findById(id);
		if (!${n}) {
			throw new ${N}NotFoundError();
		}
		${n}.update(dto);
		return ${N}Mapper.toDto(await this.${n}Repository.update(${n}));
	}
}
`,

	[`application/useCases/Delete${N}UseCase.ts`]: `import { ${N}NotFoundError } from "../../domain/error/${N}NotFoundError";
import type { ${Repo} } from "../../domain/repository/${Repo}";

export class Delete${N}UseCase {
	constructor(
		private readonly ${n}Repository: ${Repo},
	) {}

	async run(id: number): Promise<void> {
		const ${n} = await this.${n}Repository.findById(id);
		if (!${n}) {
			throw new ${N}NotFoundError();
		}
		await this.${n}Repository.delete(id);
	}
}
`,

	// ── Specs ──
	[`application/useCases/Create${N}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { Create${N}UseCase } from "./Create${N}UseCase";
import { ${N} } from "../../domain/${N}";

describe("Create${N}UseCase", () => {
	it("debería crear y devolver el DTO", async () => {
		const repo = {
			create: mock(async (e: ${N}) => ${N}.reconstitute(1, e.getName())),
		};
		const useCase = new Create${N}UseCase(repo as never);

		const result = await useCase.run({ name: "Ejemplo" });

		expect(repo.create).toHaveBeenCalled();
		expect(result).toEqual({ id: 1, name: "Ejemplo" });
	});
});
`,

	[`application/useCases/GetAll${Ns}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { GetAll${Ns}UseCase } from "./GetAll${Ns}UseCase";
import { ${N} } from "../../domain/${N}";

describe("GetAll${Ns}UseCase", () => {
	it("debería devolver la página mapeada a DTOs", async () => {
		const repo = {
			find: mock(async () => ({
				data: [${N}.reconstitute(1, "Ejemplo")],
				page: 1,
				totalItems: 1,
				totalPages: 1,
			})),
		};
		const useCase = new GetAll${Ns}UseCase(repo as never);

		const result = await useCase.run({ page: 1, limit: 10 });

		expect(result.data).toEqual([{ id: 1, name: "Ejemplo" }]);
		expect(result.totalItems).toBe(1);
	});
});
`,

	[`application/useCases/GetOne${N}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { GetOne${N}UseCase } from "./GetOne${N}UseCase";
import { ${N} } from "../../domain/${N}";
import { ${N}NotFoundError } from "../../domain/error/${N}NotFoundError";

describe("GetOne${N}UseCase", () => {
	it("debería devolver el DTO si existe", async () => {
		const repo = { findById: mock(async () => ${N}.reconstitute(1, "Ejemplo")) };
		const useCase = new GetOne${N}UseCase(repo as never);

		expect(await useCase.run(1)).toEqual({ id: 1, name: "Ejemplo" });
	});

	it("debería lanzar ${N}NotFoundError si no existe", async () => {
		const repo = { findById: mock(async () => null) };
		const useCase = new GetOne${N}UseCase(repo as never);

		expect(useCase.run(999)).rejects.toThrow(${N}NotFoundError);
	});
});
`,

	[`application/useCases/Update${N}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { Update${N}UseCase } from "./Update${N}UseCase";
import { ${N} } from "../../domain/${N}";
import { ${N}NotFoundError } from "../../domain/error/${N}NotFoundError";

describe("Update${N}UseCase", () => {
	it("debería actualizar si existe", async () => {
		const repo = {
			findById: mock(async () => ${N}.reconstitute(1, "Viejo")),
			update: mock(async (e: ${N}) => e),
		};
		const useCase = new Update${N}UseCase(repo as never);

		expect(await useCase.run(1, { name: "Nuevo" })).toEqual({
			id: 1,
			name: "Nuevo",
		});
	});

	it("debería lanzar ${N}NotFoundError si no existe", async () => {
		const repo = { findById: mock(async () => null), update: mock() };
		const useCase = new Update${N}UseCase(repo as never);

		expect(useCase.run(999, { name: "Nuevo" })).rejects.toThrow(
			${N}NotFoundError,
		);
		expect(repo.update).not.toHaveBeenCalled();
	});
});
`,

	[`application/useCases/Delete${N}UseCase.spec.ts`]: `import { describe, expect, it, mock } from "bun:test";
import { Delete${N}UseCase } from "./Delete${N}UseCase";
import { ${N} } from "../../domain/${N}";
import { ${N}NotFoundError } from "../../domain/error/${N}NotFoundError";

describe("Delete${N}UseCase", () => {
	it("debería borrar si existe", async () => {
		const repo = {
			findById: mock(async () => ${N}.reconstitute(1, "Ejemplo")),
			delete: mock(async () => {}),
		};
		const useCase = new Delete${N}UseCase(repo as never);

		await useCase.run(1);

		expect(repo.delete).toHaveBeenCalledWith(1);
	});

	it("debería lanzar ${N}NotFoundError si no existe", async () => {
		const repo = { findById: mock(async () => null), delete: mock() };
		const useCase = new Delete${N}UseCase(repo as never);

		expect(useCase.run(999)).rejects.toThrow(${N}NotFoundError);
		expect(repo.delete).not.toHaveBeenCalled();
	});
});
`,

	// ── Infraestructura ──
	[`infrastructure/repository/Prisma${Repo}.ts`]: `import type { Pagination } from "@/core/shared/domain/Pagination";
import type {
	${N}Filters,
	${Repo},
} from "../../domain/repository/${Repo}";
import { prisma } from "@/core/config/prisma";
import { ${N} } from "../../domain/${N}";

interface Prisma${N}Record {
	id: number;
	name: string;
}

export class Prisma${Repo} implements ${Repo} {
	private toDomain(raw: Prisma${N}Record): ${N} {
		return ${N}.reconstitute(raw.id, raw.name);
	}

	async find(filters: ${N}Filters): Promise<Pagination<${N}>> {
		const { page, limit, name } = filters;
		const where = {
			...(name && { name: { contains: name, mode: "insensitive" as const } }),
		};

		const [data, totalItems] = await prisma.$transaction([
			prisma.${n}.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { id: "asc" },
			}),
			prisma.${n}.count({ where }),
		]);

		return {
			data: data.map((record) => this.toDomain(record)),
			page,
			totalItems,
			totalPages: Math.ceil(totalItems / limit),
		};
	}

	async findById(id: number): Promise<${N} | null> {
		const record = await prisma.${n}.findUnique({ where: { id } });
		return record ? this.toDomain(record) : null;
	}

	async create(data: ${N}): Promise<${N}> {
		const record = await prisma.${n}.create({
			data: { name: data.getName() },
		});
		return this.toDomain(record);
	}

	async update(data: ${N}): Promise<${N}> {
		const record = await prisma.${n}.update({
			where: { id: data.getId() },
			data: { name: data.getName() },
		});
		return this.toDomain(record);
	}

	async delete(id: number): Promise<void> {
		await prisma.${n}.delete({ where: { id } });
	}
}
`,

	[`infrastructure/http/schemas/${n}Schemas.ts`]: `import { z } from "@hono/zod-openapi";

export const create${N}Schema = z.object({
	name: z.string().trim().min(1, "Name is required"),
});

export const update${N}Schema = z.object({
	name: z.string().trim().min(1, "Name is required").optional(),
});

export const ${n}IdSchema = z.object({
	id: z.string().regex(/^\\d+$/, "ID must be a valid number").transform(Number),
});

export const getAll${Ns}Schema = z.object({
	page: z.string().regex(/^\\d+$/).transform(Number).optional().default(1),
	limit: z.string().regex(/^\\d+$/).transform(Number).optional().default(10),
	name: z.string().trim().min(1).max(128).optional(),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

export const ${n}DtoSchema = z
	.object({
		id: z.number().int().openapi({ example: 1 }),
		name: z.string().openapi({ example: "Ejemplo" }),
	})
	.openapi("${N}Dto");

export const ${n}PageSchema = z.object({
	data: z.array(${n}DtoSchema),
	page: z.number().int().openapi({ example: 1 }),
	totalItems: z.number().int().openapi({ example: 10 }),
	totalPages: z.number().int().openapi({ example: 1 }),
});
`,

	[`infrastructure/http/controllers/Create${N}Controller.ts`]: controller(
		`Create${N}`,
		`create${N}Schema`,
		`const dto = validate(create${N}Schema, await c.req.json());
			return this.created(c, await this.useCase.run(dto));`,
	),
	[`infrastructure/http/controllers/GetAll${Ns}Controller.ts`]: controller(
		`GetAll${Ns}`,
		`getAll${Ns}Schema`,
		`const dto = validate(getAll${Ns}Schema, c.req.query());
			return this.ok(c, await this.useCase.run(dto));`,
	),
	[`infrastructure/http/controllers/GetOne${N}Controller.ts`]: controller(
		`GetOne${N}`,
		`${n}IdSchema`,
		`const { id } = validate(${n}IdSchema, c.req.param());
			return this.ok(c, await this.useCase.run(id));`,
	),
	[`infrastructure/http/controllers/Update${N}Controller.ts`]: controller(
		`Update${N}`,
		`${n}IdSchema, update${N}Schema`,
		`const { id } = validate(${n}IdSchema, c.req.param());
			const dto = validate(update${N}Schema, await c.req.json());
			return this.ok(c, await this.useCase.run(id, dto));`,
	),
	[`infrastructure/http/controllers/Delete${N}Controller.ts`]: controller(
		`Delete${N}`,
		`${n}IdSchema`,
		`const { id } = validate(${n}IdSchema, c.req.param());
			await this.useCase.run(id);
			return c.body(null, 204);`,
	),

	[`infrastructure/http/routes/${N}Router.ts`]: `import { OpenAPIHono } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";
import type { AuthMiddleware } from "@/modules/auth";
import type { PermissionGuard } from "@/core/shared/infrastructure/http/permissionGuard";
import { Create${N}Controller } from "../controllers/Create${N}Controller";
import { GetAll${Ns}Controller } from "../controllers/GetAll${Ns}Controller";
import { GetOne${N}Controller } from "../controllers/GetOne${N}Controller";
import { Update${N}Controller } from "../controllers/Update${N}Controller";
import { Delete${N}Controller } from "../controllers/Delete${N}Controller";
import {
	create${N}Schema,
	getAll${Ns}Schema,
	update${N}Schema,
	${n}DtoSchema,
	${n}IdSchema,
	${n}PageSchema,
} from "../schemas/${n}Schemas";

const tags = ["${Ns}"];
const security = [{ bearerAuth: [] }];
const resource = "${kebabs}";

export class ${N}Router {
	public readonly router = new OpenAPIHono();

	constructor(
		authMiddleware: AuthMiddleware,
		guard: PermissionGuard,
		create: Create${N}Controller,
		getAll: GetAll${Ns}Controller,
		getOne: GetOne${N}Controller,
		update: Update${N}Controller,
		remove: Delete${N}Controller,
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
					content: { "application/json": { schema: create${N}Schema } },
				},
			},
			responses: {
				201: jsonResponse(${n}DtoSchema, "${N} creado"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses(\`\${resource}:create\`),
			},
		});
		this.router.post("/", guard.handle(resource, "create"), create.run);

		docs.registerPath({
			method: "get",
			path: "/",
			tags,
			security,
			summary: "Listar ${ns} (paginado)",
			request: { query: getAll${Ns}Schema },
			responses: {
				200: jsonResponse(${n}PageSchema, "Lista paginada"),
				400: errorResponse("Parámetros inválidos"),
				...protectedErrorResponses(\`\${resource}:read\`),
			},
		});
		this.router.get("/", guard.handle(resource, "read"), getAll.run);

		docs.registerPath({
			method: "get",
			path: "/{id}",
			tags,
			security,
			summary: "Obtener ${n} por ID",
			request: { params: ${n}IdSchema },
			responses: {
				200: jsonResponse(${n}DtoSchema, "${N} encontrado"),
				...protectedErrorResponses(\`\${resource}:read\`),
				404: errorResponse("${N} no encontrado"),
			},
		});
		this.router.get("/:id", guard.handle(resource, "read"), getOne.run);

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
					content: { "application/json": { schema: update${N}Schema } },
				},
			},
			responses: {
				200: jsonResponse(${n}DtoSchema, "${N} actualizado"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses(\`\${resource}:update\`),
				404: errorResponse("${N} no encontrado"),
			},
		});
		this.router.put("/:id", guard.handle(resource, "update"), update.run);

		docs.registerPath({
			method: "delete",
			path: "/{id}",
			tags,
			security,
			summary: "Eliminar ${n}",
			request: { params: ${n}IdSchema },
			responses: {
				204: { description: "${N} eliminado" },
				...protectedErrorResponses(\`\${resource}:delete\`),
				404: errorResponse("${N} no encontrado"),
			},
		});
		this.router.delete("/:id", guard.handle(resource, "delete"), remove.run);
	}
}
`,

	"module.ts": `import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { Create${N}UseCase } from "./application/useCases/Create${N}UseCase";
import { Delete${N}UseCase } from "./application/useCases/Delete${N}UseCase";
import { GetAll${Ns}UseCase } from "./application/useCases/GetAll${Ns}UseCase";
import { GetOne${N}UseCase } from "./application/useCases/GetOne${N}UseCase";
import { Update${N}UseCase } from "./application/useCases/Update${N}UseCase";
import { Create${N}Controller } from "./infrastructure/http/controllers/Create${N}Controller";
import { Delete${N}Controller } from "./infrastructure/http/controllers/Delete${N}Controller";
import { GetAll${Ns}Controller } from "./infrastructure/http/controllers/GetAll${Ns}Controller";
import { GetOne${N}Controller } from "./infrastructure/http/controllers/GetOne${N}Controller";
import { Update${N}Controller } from "./infrastructure/http/controllers/Update${N}Controller";
import { ${N}Router } from "./infrastructure/http/routes/${N}Router";
import { Prisma${Repo} } from "./infrastructure/repository/Prisma${Repo}";

export const ${n}Module: AppModule = {
	mount(app, container) {
		const repo = new Prisma${Repo}();
		const router = new ${N}Router(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermissionGuard),
			new Create${N}Controller(new Create${N}UseCase(repo)),
			new GetAll${Ns}Controller(new GetAll${Ns}UseCase(repo)),
			new GetOne${N}Controller(new GetOne${N}UseCase(repo)),
			new Update${N}Controller(new Update${N}UseCase(repo)),
			new Delete${N}Controller(new Delete${N}UseCase(repo)),
		);
		app.route("/api/${kebabs}", router.router);
	},
};
`,
};

function controller(useCase: string, schemas: string, body: string): string {
	return `import type { Context } from "hono";
import { ${useCase}UseCase } from "../../../application/useCases/${useCase}UseCase";
import { ${schemas} } from "../schemas/${n}Schemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

export class ${useCase}Controller extends BaseController {
	constructor(private readonly useCase: ${useCase}UseCase) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			${body}
		});
	};
}
`;
}

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
  name      String    @db.VarChar(255)
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
  2. Añadir los permisos "${kebabs}:{create,read,update,delete}" en prisma/seed.ts
  3. Regenerar el contrato del frontend: pnpm gen:api
`);
