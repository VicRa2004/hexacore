// Crea un módulo CRUD completo: backend (hexagonal + modelo Prisma), contrato
// OpenAPI regenerado y frontend (api, hooks, formulario, tabla, página y ruta).
// Uso: pnpm gen:module <nombre>   ·   solo backend: --solo-backend
import { join } from "node:path";

const args = process.argv.slice(2);
const nombre = args.find((a) => !a.startsWith("--"));
const root = join(import.meta.dir, "..");

const run = (cmd: string[], cwd = root) => {
	const { exitCode } = Bun.spawnSync(cmd, {
		cwd,
		stdout: "inherit",
		stderr: "inherit",
	});
	if (exitCode !== 0) process.exit(exitCode ?? 1);
};

run(["bun", "scripts/gen-module.ts", ...args], join(root, "backend"));
if (nombre && !args.includes("--solo-backend")) {
	run(["pnpm", "gen:api"]);
	run(["bun", "scripts/gen-module-web.ts", nombre]);
}
