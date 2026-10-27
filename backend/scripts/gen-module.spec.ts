import { afterAll, describe, it } from "bun:test";
import { cpSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Genera un módulo en una copia temporal del backend y comprueba que compila,
// pasa sus tests y check:architecture; después genera su frontend
// (scripts/gen-module-web.ts de la raíz) y comprueba que compila. Detecta
// plantillas desfasadas.
const backend = join(import.meta.dir, "..");
const repo = join(backend, "..");
const tmp = mkdtempSync(join(tmpdir(), "gen-module-"));
const web = join(tmp, "frontend");

const sh = (cmd: string[], cwd = tmp) => {
	const res = Bun.spawnSync(cmd, { cwd, stderr: "pipe", stdout: "pipe" });
	if (res.exitCode !== 0) {
		throw new Error(`${cmd.join(" ")}\n${res.stdout}\n${res.stderr}`);
	}
};

afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("gen-module", () => {
	it(
		"genera un módulo que compila, pasa sus tests y check:architecture",
		() => {
			for (const entry of [
				"src",
				"prisma",
				"tsconfig.json",
				"prisma.config.ts",
				"package.json",
				".dependency-cruiser.cjs",
			]) {
				cpSync(join(backend, entry), join(tmp, entry), { recursive: true });
			}
			symlinkSync(join(backend, "node_modules"), join(tmp, "node_modules"));

			sh([
				"bun",
				join(backend, "scripts/gen-module.ts"),
				"ordenCompra",
				"--root",
				tmp,
			]);
			sh(["node_modules/.bin/tsc", "--noEmit"]);
			sh(["bun", "test", "src/modules/ordenCompra"]);
			sh([
				"node_modules/.bin/depcruise",
				"src",
				"--config",
				".dependency-cruiser.cjs",
			]);
		},
		{ timeout: 120_000 },
	);

	it(
		"genera su frontend a partir del OpenAPI, y compila",
		() => {
			const spec = join(tmp, "openapi.json");
			// El spec sale del backend temporal (con el módulo ya generado): el
			// script resuelve "@/" con el tsconfig de su carpeta, por eso se copia.
			cpSync(
				join(backend, "scripts/export-openapi.ts"),
				join(tmp, "scripts/export-openapi.ts"),
			);
			sh(["bun", "scripts/export-openapi.ts", spec]);

			for (const entry of [
				"src",
				"index.html",
				"vite.config.ts",
				"tsconfig.json",
				"package.json",
			]) {
				cpSync(join(repo, "frontend", entry), join(web, entry), {
					recursive: true,
				});
			}
			symlinkSync(
				join(repo, "frontend/node_modules"),
				join(web, "node_modules"),
			);
			sh([
				join(repo, "node_modules/.bin/openapi-typescript"),
				spec,
				"--root-types",
				"--root-types-no-schema-prefix",
				"-o",
				join(web, "src/core/api/schema.gen.ts"),
			]);
			sh([
				"bun",
				join(repo, "scripts/gen-module-web.ts"),
				"ordenCompra",
				"--root",
				web,
				"--openapi",
				spec,
			]);
			// vite build regenera routeTree.gen.ts con la ruta nueva.
			sh(["node_modules/.bin/vite", "build"], web);
			sh(["node_modules/.bin/tsc", "--noEmit"], web);
		},
		{ timeout: 120_000 },
	);
});
