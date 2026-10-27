// Genera la parte frontend de un módulo CRUD (api, hooks, schema, formulario,
// tabla, página y ruta) a partir del OpenAPI que exporta `pnpm gen:api`.
// Uso: bun scripts/gen-module-web.ts <nombre> [--root <dir-frontend>] [--openapi <spec.json>]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const flag = (name: string, fallback: string) => {
	const i = args.indexOf(name);
	return resolve(i >= 0 ? (args[i + 1] ?? "") : fallback);
};
const repoRoot = join(import.meta.dir, "..");
const root = flag("--root", join(repoRoot, "frontend"));
const specPath = flag(
	"--openapi",
	join(repoRoot, "node_modules/.cache/openapi.json"),
);
const nombre = args.find(
	(a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"),
);

const fallar = (mensaje: string): never => {
	console.error(mensaje);
	process.exit(1);
};

if (!nombre || !/^[a-z][a-zA-Z0-9]*$/.test(nombre)) {
	fallar(
		"Uso: pnpm gen:module:web <nombre>  (el mismo que en gen:module, p. ej. producto)",
	);
}
const n = nombre as string;

// ── Nombres: misma regla que backend/scripts/gen-module.ts ──────────────────
const N = n[0]?.toUpperCase() + n.slice(1);
const plural = (s: string) => (/[aeiou]$/i.test(s) ? `${s}s` : `${s}es`);
const ns = plural(n);
const Ns = plural(N);
const kebabs = plural(n.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
const humano = (s: string) => {
	const t = s.replace(/[A-Z]/g, (c) => ` ${c.toLowerCase()}`);
	return t[0]?.toUpperCase() + t.slice(1);
};
const ruta = `/api/${kebabs}`;

// ── Lectura del contrato ─────────────────────────────────────────────────────
interface Propiedad {
	type?: string;
	enum?: string[];
	nullable?: boolean;
	$ref?: string;
}
interface Objeto {
	properties?: Record<string, Propiedad>;
	required?: string[];
}
interface Parametro {
	name: string;
	in: string;
	schema?: Propiedad;
}

if (!existsSync(specPath)) {
	fallar(`No existe ${specPath}: ejecuta antes "pnpm gen:api".`);
}
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const coleccion = spec.paths?.[ruta];
const dto: Objeto | undefined = spec.components?.schemas?.[`${N}Dto`];
const cuerpo: Objeto | undefined =
	coleccion?.post?.requestBody?.content?.["application/json"]?.schema;
if (
	!coleccion?.get ||
	!coleccion?.post ||
	!spec.paths?.[`${ruta}/{id}`] ||
	!dto ||
	!cuerpo
) {
	fallar(
		`El OpenAPI no tiene el CRUD de ${ruta} ni el schema ${N}Dto. ` +
			`¿Creaste el módulo con "pnpm gen:module ${n}" y regeneraste con "pnpm gen:api"?`,
	);
}

const moduleDir = join(root, "src/modules", ns);
const routeFile = join(root, "src/routes/_authenticated", `${kebabs}.tsx`);
if (existsSync(moduleDir) || existsSync(routeFile)) {
	fallar(`Ya existe ${moduleDir} o ${routeFile}`);
}

// Filtro de texto del listado: primer parámetro de query que no sea de paginación.
const filtro = (coleccion.get.parameters as Parametro[] | undefined)?.find(
	(p) => p.in === "query" && !["pagina", "limite"].includes(p.name),
)?.name;

// ── Campos del formulario (cuerpo del POST) ──────────────────────────────────
type Tipo = "texto" | "numero" | "entero" | "booleano" | "opciones";
interface Campo {
	nombre: string;
	tipo: Tipo;
	requerido: boolean;
	nullable: boolean;
	opciones?: string[];
}

const omitidos: string[] = [];
const campos: Campo[] = [];
for (const [nombreCampo, p] of Object.entries(cuerpo?.properties ?? {})) {
	const tipo: Tipo | undefined = p.enum
		? "opciones"
		: p.type === "string"
			? "texto"
			: p.type === "integer"
				? "entero"
				: p.type === "number"
					? "numero"
					: p.type === "boolean"
						? "booleano"
						: undefined;
	const requerido = cuerpo?.required?.includes(nombreCampo) ?? false;
	if (!tipo) {
		// shortcut: arrays, objetos y $ref no tienen campo genérico; se añaden a mano.
		if (requerido) {
			fallar(
				`El campo obligatorio "${nombreCampo}" no es de un tipo soportado (texto, número, booleano o enum).`,
			);
		}
		omitidos.push(nombreCampo);
		continue;
	}
	campos.push({
		nombre: nombreCampo,
		tipo,
		requerido,
		nullable: !!p.nullable,
		opciones: p.enum,
	});
}

const vacio = (c: Campo) => (c.nullable ? "null" : "undefined");
const zodCampo = (c: Campo): string => {
	switch (c.tipo) {
		case "booleano":
			return "z.boolean()";
		case "opciones":
			return `z.enum([${c.opciones?.map((o) => JSON.stringify(o)).join(", ")}])`;
		case "texto":
			return c.requerido
				? `z.string().trim().min(1, "Obligatorio")`
				: `z.string().trim().transform((v) => v || ${vacio(c)})`;
		default: {
			const entero =
				c.tipo === "entero" ? " && Number.isInteger(Number(v))" : "";
			const valido = `.refine((v) => v === "" || (!Number.isNaN(Number(v))${entero}), "Número no válido")`;
			return c.requerido
				? `z.string().trim().min(1, "Obligatorio")${valido}.transform(Number)`
				: `z.string().trim()${valido}.transform((v) => (v === "" ? ${vacio(c)} : Number(v)))`;
		}
	}
};
const valorVacio = (c: Campo) =>
	c.tipo === "booleano"
		? "false"
		: c.tipo === "opciones"
			? JSON.stringify(c.opciones?.[0] ?? "")
			: `""`;
// Campos que el DTO no devuelve: al editar no se conoce su valor, así que ni se
// muestran ni se envían (enviarlos vacíos pisaría lo guardado).
const soloAlCrear = campos.filter((c) => !dto?.properties?.[c.nombre]);
const desdeDto = (c: Campo) => {
	const v = `dto.${c.nombre}`;
	if (!dto?.properties?.[c.nombre]) return valorVacio(c);
	if (c.tipo === "booleano" || c.tipo === "opciones")
		return `${v} ?? ${valorVacio(c)}`;
	return c.tipo === "texto" ? `${v} ?? ""` : `${v} == null ? "" : String(${v})`;
};
const jsxCampo = (c: Campo) => {
	const etiqueta = JSON.stringify(humano(c.nombre));
	const componente =
		c.tipo === "booleano"
			? `<campo.CampoCheckbox label=${etiqueta} />`
			: c.tipo === "opciones"
				? `<campo.CampoSelect label=${etiqueta}>\n${c.opciones
						?.map(
							(o) =>
								`\t\t\t\t\t\t\t\t<option value=${JSON.stringify(o)}>${o}</option>`,
						)
						.join("\n")}\n\t\t\t\t\t\t\t</campo.CampoSelect>`
				: `<campo.CampoTexto label=${etiqueta}${c.tipo === "texto" ? "" : ` type="number" inputMode="${c.tipo === "entero" ? "numeric" : "decimal"}"`} />`;
	const campo = `<form.AppField name="${c.nombre}">\n\t\t\t\t\t{(campo) => ${componente}}\n\t\t\t\t</form.AppField>`;
	return soloAlCrear.includes(c)
		? `\t\t\t\t{!inicial && (\n\t\t\t\t\t${campo}\n\t\t\t\t)}`
		: `\t\t\t\t${campo}`;
};

// ── Columnas de la tabla (DTO) ───────────────────────────────────────────────
const columnas = Object.entries(dto?.properties ?? {})
	.filter(([, p]) =>
		["string", "integer", "number", "boolean"].includes(p.type ?? ""),
	)
	.map(([nombreCol, p]) => {
		const celda =
			nombreCol === "id"
				? "`#${fila.id}`"
				: p.type === "boolean"
					? `(\n\t\t\t\t<Badge variant={fila.${nombreCol} ? "success" : "default"}>\n\t\t\t\t\t{fila.${nombreCol} ? "Sí" : "No"}\n\t\t\t\t</Badge>\n\t\t\t)`
					: `fila.${nombreCol} ?? "—"`;
		const clase =
			nombreCol === "id"
				? `\n\t\t\tclassName: "font-mono text-xs text-tinta-tenue",`
				: "";
		return `\t\t{\n\t\t\tcabecera: ${JSON.stringify(nombreCol === "id" ? "ID" : humano(nombreCol))},${clase}\n\t\t\tcelda: (fila) => ${celda},\n\t\t},`;
	});
const usaBadge = columnas.some((c) => c.includes("<Badge"));

// ── Plantillas ───────────────────────────────────────────────────────────────
const files: Record<string, string> = {
	[`api/${ns}Api.ts`]: `import { apiClient } from "@/core/api/client";
import type { components, paths } from "@/core/api/schema.gen";

export type ${N}Dto = components["schemas"]["${N}Dto"];
export type Crear${N}Input =
	paths["${ruta}"]["post"]["requestBody"]["content"]["application/json"];
export type Actualizar${N}Input =
	paths["${ruta}/{id}"]["put"]["requestBody"]["content"]["application/json"];
type ${Ns}Pagina =
	paths["${ruta}"]["get"]["responses"][200]["content"]["application/json"];

export interface Obtener${Ns}Params {
	pagina?: number;
	limite?: number;${filtro ? `\n\t${filtro}?: string;` : ""}
}

export const ${ns}Api = {
	async obtenerTodos(params: Obtener${Ns}Params = {}): Promise<${Ns}Pagina> {
		const response = await apiClient.get<${Ns}Pagina>("/${kebabs}", { params });
		return response.data;
	},

	async crear(datos: Crear${N}Input): Promise<${N}Dto> {
		const response = await apiClient.post<${N}Dto>("/${kebabs}", datos);
		return response.data;
	},

	async actualizar(id: number, datos: Actualizar${N}Input): Promise<${N}Dto> {
		const response = await apiClient.put<${N}Dto>(\`/${kebabs}/\${id}\`, datos);
		return response.data;
	},

	async eliminar(id: number): Promise<void> {
		await apiClient.delete(\`/${kebabs}/\${id}\`);
	},
};
`,

	[`hooks/use${Ns}Query.ts`]: `import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type Obtener${Ns}Params, ${ns}Api } from "../api/${ns}Api";

export const ${ns}Keys = {
	all: ["${ns}"] as const,
	lists: () => [...${ns}Keys.all, "list"] as const,
	list: (params: Obtener${Ns}Params) => [...${ns}Keys.lists(), params] as const,
};

export function use${Ns}Query(params: Obtener${Ns}Params = {}) {
	return useQuery({
		queryKey: ${ns}Keys.list(params),
		queryFn: () => ${ns}Api.obtenerTodos(params),
		// Mantiene la página anterior visible mientras llega la siguiente.
		placeholderData: keepPreviousData,
	});
}
`,

	[`hooks/use${Ns}Mutation.ts`]: `import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { type Actualizar${N}Input, ${ns}Api } from "../api/${ns}Api";
import { ${ns}Keys } from "./use${Ns}Query";

const onError = (error: unknown) => toast.error(getErrorMessage(error));

function useInvalidar() {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: ${ns}Keys.lists() });
}

export function useCrear${N}Mutation() {
	const invalidar = useInvalidar();
	return useMutation({
		mutationFn: ${ns}Api.crear,
		onSuccess: () => {
			toast.success("${humano(n)} creado");
			return invalidar();
		},
		onError,
	});
}

export function useActualizar${N}Mutation() {
	const invalidar = useInvalidar();
	return useMutation({
		mutationFn: ({ id, datos }: { id: number; datos: Actualizar${N}Input }) =>
			${ns}Api.actualizar(id, datos),
		onSuccess: () => {
			toast.success("${humano(n)} guardado");
			return invalidar();
		},
		onError,
	});
}

export function useEliminar${N}Mutation() {
	const invalidar = useInvalidar();
	return useMutation({
		mutationFn: ${ns}Api.eliminar,
		onSuccess: () => {
			toast.success("${humano(n)} eliminado");
			return invalidar();
		},
		onError,
	});
}
`,

	[`schemas/${n}Schemas.ts`]: `import { z } from "zod";
import type { ${N}Dto } from "../api/${ns}Api";

/** Valida lo que se escribe en el formulario y lo convierte al cuerpo de la API. */
export const ${n}FormSchema = z.object({
${campos.map((c) => `\t${c.nombre}: ${zodCampo(c)},`).join("\n")}
});

export type ${N}FormValues = z.input<typeof ${n}FormSchema>;

export const ${n}FormVacio: ${N}FormValues = {
${campos.map((c) => `\t${c.nombre}: ${valorVacio(c)},`).join("\n")}
};

export const ${n}AFormValues = (dto: ${N}Dto): ${N}FormValues => ({
${campos.map((c) => `\t${c.nombre}: ${desdeDto(c)},`).join("\n")}
});
${
	soloAlCrear.length
		? `
/** Al editar: sin los campos que \`${N}Dto\` no devuelve, para no pisarlos. */
export const ${n}FormSchemaEdicion = ${n}FormSchema.omit({
${soloAlCrear.map((c) => `\t${c.nombre}: true,`).join("\n")}
});
`
		: ""
}`,

	[`components/${N}Form.tsx`]: `import { useAppForm } from "@/core/components/form/useAppForm";
import type { ${N}Dto } from "../api/${ns}Api";
import {
	useActualizar${N}Mutation,
	useCrear${N}Mutation,
} from "../hooks/use${Ns}Mutation";
import {
	${n}AFormValues,
	${n}FormSchema,${soloAlCrear.length ? `\n\t${n}FormSchemaEdicion,` : ""}
	${n}FormVacio,
} from "../schemas/${n}Schemas";

interface ${N}FormProps {
	/** Sin \`inicial\` crea; con él, edita. */
	inicial?: ${N}Dto;
	onGuardado: () => void;
}

export function ${N}Form({ inicial, onGuardado }: ${N}FormProps) {
	const crear = useCrear${N}Mutation();
	const actualizar = useActualizar${N}Mutation();

	const form = useAppForm({
		defaultValues: inicial ? ${n}AFormValues(inicial) : ${n}FormVacio,
${
			soloAlCrear.length
				? `		validators: {
			// La de edición valida un subconjunto de los mismos valores.
			onSubmit: (inicial ? ${n}FormSchemaEdicion : ${n}FormSchema) as typeof ${n}FormSchema,
		},
		onSubmit: async ({ value }) => {
			if (inicial) {
				const datos = ${n}FormSchemaEdicion.parse(value);
				await actualizar.mutateAsync({ id: inicial.id, datos });
			} else await crear.mutateAsync(${n}FormSchema.parse(value));
			onGuardado();
		},`
				: `		validators: { onSubmit: ${n}FormSchema },
		onSubmit: async ({ value }) => {
			const datos = ${n}FormSchema.parse(value);
			if (inicial) await actualizar.mutateAsync({ id: inicial.id, datos });
			else await crear.mutateAsync(datos);
			onGuardado();
		},`
		}
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
${campos.map(jsxCampo).join("\n")}
				<div className="flex justify-end">
					<form.BotonEnviar>{inicial ? "Guardar" : "Crear"}</form.BotonEnviar>
				</div>
			</form.Formulario>
		</form.AppForm>
	);
}
`,

	[`components/${Ns}Table.tsx`]: `import { Pencil, Trash2 } from "lucide-react";
${usaBadge ? `import { Badge } from "@/core/components/ui/Badge";\n` : ""}import { Button } from "@/core/components/ui/Button";
import { type Columna, type Pagina, Tabla } from "@/core/components/ui/Table";
import type { ${N}Dto } from "../api/${ns}Api";

interface ${Ns}TableProps {
	pagina?: Pagina<${N}Dto>;
	isLoading: boolean;
	error?: unknown;
	onCambioPagina: (pagina: number) => void;
	onEditar: (fila: ${N}Dto) => void;
	onEliminar: (fila: ${N}Dto) => void;
}

export function ${Ns}Table({
	pagina,
	isLoading,
	error,
	onCambioPagina,
	onEditar,
	onEliminar,
}: ${Ns}TableProps) {
	const columnas: Columna<${N}Dto>[] = [
${columnas.join("\n")}
		{
			cabecera: <span className="sr-only">Acciones</span>,
			className: "text-right",
			celda: (fila) => (
				<div className="flex justify-end gap-1">
					<Button variant="ghost" size="sm" onClick={() => onEditar(fila)} aria-label="Editar">
						<Pencil className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="sm" onClick={() => onEliminar(fila)} aria-label="Eliminar">
						<Trash2 className="h-4 w-4 text-rose-400" />
					</Button>
				</div>
			),
		},
	];

	return (
		<Tabla
			etiqueta="${humano(ns)}"
			columnas={columnas}
			datos={pagina}
			clave={(fila) => fila.id}
			onCambioPagina={onCambioPagina}
			isLoading={isLoading}
			error={error}
		/>
	);
}
`,

	[`pages/${Ns}Page.tsx`]: `import { Plus${filtro ? ", Search" : ""} } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/components/ui/Button";
import { ConfirmDialog } from "@/core/components/ui/ConfirmDialog";
import { Dialog } from "@/core/components/ui/Dialog";
${filtro ? `import { Input } from "@/core/components/ui/Input";\n` : ""}import type { ${N}Dto } from "../api/${ns}Api";
import { ${N}Form } from "../components/${N}Form";
import { ${Ns}Table } from "../components/${Ns}Table";
import { useEliminar${N}Mutation } from "../hooks/use${Ns}Mutation";
import { use${Ns}Query } from "../hooks/use${Ns}Query";

export function ${Ns}Page() {
	const [pagina, setPagina] = useState(1);${filtro ? `\n\tconst [busqueda, setBusqueda] = useState("");` : ""}
	/** \`null\` = cerrado; \`"nuevo"\` = alta; un DTO = edición. */
	const [editando, setEditando] = useState<${N}Dto | "nuevo" | null>(null);
	const [eliminando, setEliminando] = useState<${N}Dto | null>(null);
	const eliminar = useEliminar${N}Mutation();
	const { data, isLoading, error } = use${Ns}Query({
		pagina,
		limite: 10,${filtro ? `\n\t\t${filtro}: busqueda.trim() || undefined,` : ""}
	});

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-bold tracking-tight text-tinta">${humano(ns)}</h1>
				<div className="flex gap-2">${
					filtro
						? `
					<div className="relative w-full sm:w-64">
						<Input
							aria-label="Buscar por ${humano(filtro).toLowerCase()}"
							placeholder="Buscar por ${humano(filtro).toLowerCase()}..."
							value={busqueda}
							onChange={(e) => {
								setBusqueda(e.target.value);
								setPagina(1);
							}}
							className="pl-9"
						/>
						<Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-tinta-tenue" />
					</div>`
						: ""
				}
					<Button onClick={() => setEditando("nuevo")}>
						<Plus className="h-4 w-4" />
						Nuevo
					</Button>
				</div>
			</div>

			<${Ns}Table
				pagina={data}
				isLoading={isLoading}
				error={error}
				onCambioPagina={setPagina}
				onEditar={setEditando}
				onEliminar={setEliminando}
			/>

			<Dialog
				abierto={editando !== null}
				onCerrar={() => setEditando(null)}
				titulo={editando === "nuevo" ? "Nuevo ${humano(n).toLowerCase()}" : "Editar ${humano(n).toLowerCase()}"}
			>
				{editando !== null && (
					<${N}Form
						key={editando === "nuevo" ? "nuevo" : editando.id}
						inicial={editando === "nuevo" ? undefined : editando}
						onGuardado={() => setEditando(null)}
					/>
				)}
			</Dialog>

			<ConfirmDialog
				abierto={eliminando !== null}
				titulo="¿Eliminar ${humano(n).toLowerCase()}?"
				mensaje="Esta acción no se puede deshacer."
				textoConfirmar="Eliminar"
				peligroso
				isLoading={eliminar.isPending}
				onCancelar={() => setEliminando(null)}
				onConfirmar={() =>
					eliminando &&
					eliminar.mutate(eliminando.id, { onSuccess: () => setEliminando(null) })
				}
			/>
		</div>
	);
}
`,
};

// ── Escritura ────────────────────────────────────────────────────────────────
for (const [path, content] of Object.entries(files)) {
	const target = join(moduleDir, path);
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, content);
}
mkdirSync(dirname(routeFile), { recursive: true });
writeFileSync(
	routeFile,
	`import { createFileRoute } from "@tanstack/react-router";
import { ${Ns}Page } from "@/modules/${ns}/pages/${Ns}Page";

export const Route = createFileRoute("/_authenticated/${kebabs}")({
	component: ${Ns}Page,
});
`,
);

const { exitCode } = Bun.spawnSync(
	[
		join(repoRoot, "node_modules/.bin/biome"),
		"format",
		"--write",
		"--vcs-use-ignore-file=false",
		`--config-path=${repoRoot}`,
		moduleDir,
		routeFile,
	],
	{ stdout: "inherit", stderr: "inherit" },
);
if (exitCode !== 0) fallar("Falló el formateo con Biome");

console.log(`
Frontend de ${n} creado en src/modules/${ns} y src/routes/_authenticated/${kebabs}.tsx.
${omitidos.length ? `Campos sin control genérico (añadir a mano en ${N}Form): ${omitidos.join(", ")}\n` : ""}Siguiente paso: añadir el enlace a /${kebabs} en src/core/components/layout/MainLayout.tsx.
`);
