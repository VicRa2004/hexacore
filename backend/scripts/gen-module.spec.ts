import { afterAll, describe, it } from "bun:test";
import { cpSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Genera un módulo en una copia temporal del backend y comprueba que compila,
// pasa sus tests y check:architecture. Detecta plantillas desfasadas.
const backend = join(import.meta.dir, "..");
const tmp = mkdtempSync(join(tmpdir(), "gen-module-"));

const sh = (cmd: string[]) => {
	const res = Bun.spawnSync(cmd, { cwd: tmp, stderr: "pipe", stdout: "pipe" });
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
});
