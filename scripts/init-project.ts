/**
 * Renombra el template ("hexacore") al proyecto nuevo: paquetes, BD, título de
 * la API, docs y CI. Uso: `pnpm init:project` desde la raíz.
 *
 * Idempotente: si ya no queda "hexacore", no cambia nada.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// La URL del template se conserva: el README la usa para recibir mejoras.
const TEMPLATE_URL = "VicRa2004/hexacore";
// Los planes de sesión del template son historia: se dejan como están.
const SKIP = /^(scripts\/init-project\.ts|docs\/\d\d-.*\.md|pnpm-lock\.yaml)$/;

function ask(question: string, fallback: string): string {
	return prompt(`${question} [${fallback}]:`)?.trim() || fallback;
}

const name = ask("Nombre del proyecto", "Mi Proyecto");
const slug = name
	.normalize("NFD")
	.replace(/[̀-ͯ]/g, "")
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, "-")
	.replace(/^-|-$/g, "");
if (!slug) throw new Error(`Nombre inválido: "${name}"`);

const dbName = ask("Nombre de la BD", `${slug.replaceAll("-", "_")}_db`);
const apiTitle = ask("Título de la API", `${name} API`);

// El orden importa: primero lo específico, al final el nombre suelto.
const replacements: [RegExp, string][] = [
	[/Hexacore API/g, apiTitle],
	[/hexacore_db/g, dbName],
	[/hexacore_test/g, `${dbName}_test`],
	[/Hexacore/g, name],
	[/(?<!VicRa2004\/)hexacore/g, slug],
];

const files = execSync("git ls-files", { encoding: "utf8" })
	.split("\n")
	.filter((file) => file && !SKIP.test(file));

const changed: string[] = [];
for (const file of files) {
	let content: string;
	try {
		content = readFileSync(file, "utf8");
	} catch {
		continue; // borrado en el árbol de trabajo
	}
	const next = replacements.reduce(
		(text, [from, to]) => text.replace(from, to),
		content,
	);
	if (next !== content) {
		writeFileSync(file, next);
		changed.push(file);
	}
}

if (changed.length === 0) {
	console.log('Nada que cambiar: no queda "hexacore" en el proyecto.');
} else {
	console.log(`\n${changed.length} archivos actualizados:`);
	for (const file of changed) console.log(`  - ${file}`);
	console.log(`
Proyecto: ${name} (${slug}) · BD: ${dbName} · API: ${apiTitle}

Siguientes pasos:
  1. Revisa el diff: git diff
  2. pnpm install && pnpm verify
  3. cp backend/.env.example backend/.env (y crea el usuario/BD "${slug}" / "${dbName}" en Postgres)
  4. git remote add template git@github.com:${TEMPLATE_URL}.git (ver README, "Recibir mejoras del template")`);
}
