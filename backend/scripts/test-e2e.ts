/**
 * Ejecuta los `*.e2e.spec.ts` contra una BD de test limpia: la resetea (aplica todas
 * las migraciones), carga el seed y lanza `bun test`. Uso: `pnpm --filter backend test:e2e`.
 */
const url = process.env.DATABASE_URL_TEST;

if (!url) {
	console.error("❌ Define DATABASE_URL_TEST (ver backend/.env.example).");
	process.exit(1);
}
// La BD se borra entera en cada ejecución: nunca contra la de desarrollo.
if (url === process.env.DATABASE_URL) {
	console.error("❌ DATABASE_URL_TEST no puede ser la misma que DATABASE_URL.");
	process.exit(1);
}

const env = { ...process.env, DATABASE_URL: url, NODE_ENV: "test" };

function run(cmd: string[]) {
	const { exitCode } = Bun.spawnSync(cmd, {
		env,
		stdio: ["inherit", "inherit", "inherit"],
	});
	if (exitCode !== 0) process.exit(exitCode);
}

const prisma = ["bun", "node_modules/prisma/build/index.js"];
run([...prisma, "migrate", "reset", "--force"]);
run(["bun", "prisma/seed.ts"]);
run(["bun", "test", ".e2e.spec.ts", ...process.argv.slice(2)]);
