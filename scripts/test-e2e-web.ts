import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const BACKEND_DIR = path.join(ROOT_DIR, "backend");

function cargarEnvBackendSiFalta(): void {
	const envPath = path.join(BACKEND_DIR, ".env");
	if (!existsSync(envPath)) return;

	for (const linea of readFileSync(envPath, "utf8").split(/\r?\n/)) {
		const limpia = linea.trim();
		if (!limpia || limpia.startsWith("#")) continue;
		const separador = limpia.indexOf("=");
		if (separador === -1) continue;

		const clave = limpia.slice(0, separador).trim();
		if (!clave || process.env[clave] !== undefined) continue;

		let valor = limpia.slice(separador + 1).trim();
		if (
			(valor.startsWith('"') && valor.endsWith('"')) ||
			(valor.startsWith("'") && valor.endsWith("'"))
		) {
			valor = valor.slice(1, -1);
		}
		process.env[clave] = valor;
	}
}

function obtenerPuertoLibre(): Promise<number> {
	return new Promise((resolve, reject) => {
		const servidor = net.createServer();
		servidor.unref();
		servidor.on("error", reject);
		servidor.listen(0, "127.0.0.1", () => {
			const direccion = servidor.address();
			if (!direccion || typeof direccion === "string") {
				servidor.close(() =>
					reject(new Error("No se pudo obtener un puerto libre")),
				);
				return;
			}
			const puerto = direccion.port;
			servidor.close((err) => (err ? reject(err) : resolve(puerto)));
		});
	});
}

function ejecutarSync(
	cmd: string[],
	cwd: string,
	env: Record<string, string | undefined>,
): void {
	const { exitCode } = Bun.spawnSync(cmd, {
		cwd,
		env,
		stdio: ["inherit", "inherit", "inherit"],
	});
	if (exitCode !== 0) process.exit(exitCode);
}

async function esperarUrl(
	url: string,
	nombre: string,
	proceso: Bun.Subprocess,
	timeoutMs = 30_000,
): Promise<void> {
	const inicio = Date.now();
	while (Date.now() - inicio < timeoutMs) {
		if (proceso.exitCode !== null) {
			throw new Error(
				`${nombre} terminó inesperadamente con código ${proceso.exitCode}`,
			);
		}
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			// Servidor aún arrancando.
		}
		await Bun.sleep(250);
	}
	throw new Error(`Timeout esperando a ${nombre} en ${url}`);
}

async function detenerProceso(proceso: Bun.Subprocess | undefined): Promise<void> {
	if (!proceso || proceso.exitCode !== null) return;
	proceso.kill("SIGTERM");
	const timeout = setTimeout(() => {
		if (proceso.exitCode === null) proceso.kill("SIGKILL");
	}, 3_000);
	await proceso.exited;
	clearTimeout(timeout);
}

cargarEnvBackendSiFalta();

const testDbUrl = process.env.DATABASE_URL_TEST;
if (!testDbUrl) {
	console.error("❌ Define DATABASE_URL_TEST (ver backend/.env.example).");
	process.exit(1);
}
if (testDbUrl === process.env.DATABASE_URL) {
	console.error("❌ DATABASE_URL_TEST no puede ser la misma que DATABASE_URL.");
	process.exit(1);
}

const dbEnv = { ...process.env, DATABASE_URL: testDbUrl, NODE_ENV: "test" };
const prismaBin = path.join(BACKEND_DIR, "node_modules/prisma/build/index.js");

ejecutarSync(["bun", prismaBin, "migrate", "reset", "--force"], BACKEND_DIR, dbEnv);
ejecutarSync(["bun", "prisma/seed-demo.ts"], BACKEND_DIR, dbEnv);

const puertoBackend = await obtenerPuertoLibre();
const puertoFrontend = await obtenerPuertoLibre();
const urlBackend = `http://127.0.0.1:${puertoBackend}`;
const urlFrontend = `http://127.0.0.1:${puertoFrontend}`;

let backendProc: Bun.Subprocess | undefined;
let frontendProc: Bun.Subprocess | undefined;
let codigoSalida = 1;

try {
	backendProc = Bun.spawn(["bun", "src/index.ts"], {
		cwd: BACKEND_DIR,
		env: {
			...dbEnv,
			PORT: String(puertoBackend),
			CORS_ORIGIN: `${urlFrontend},http://localhost:${puertoFrontend}`,
			APP_URL: urlFrontend,
			JWT_SECRET:
				process.env.JWT_SECRET ||
				"e2e_test_secret_de_al_menos_32_caracteres_xx",
		},
		stdio: ["ignore", "inherit", "inherit"],
	});

	frontendProc = Bun.spawn(
		[
			"pnpm",
			"--filter",
			"frontend",
			"exec",
			"vite",
			"--port",
			String(puertoFrontend),
			"--strictPort",
			"--host",
			"127.0.0.1",
		],
		{
			cwd: ROOT_DIR,
			env: {
				...process.env,
				VITE_API_URL: urlBackend,
			},
			stdio: ["ignore", "inherit", "inherit"],
		},
	);

	await esperarUrl(`${urlBackend}/health`, "Backend E2E", backendProc);
	await esperarUrl(`${urlFrontend}/login`, "Frontend E2E", frontendProc);

	const playwrightProc = Bun.spawn(
		[
			"pnpm",
			"--filter",
			"frontend",
			"exec",
			"playwright",
			"test",
			...process.argv.slice(2),
		],
		{
			cwd: ROOT_DIR,
			env: {
				...process.env,
				E2E_BASE_URL: urlFrontend,
			},
			stdio: ["inherit", "inherit", "inherit"],
		},
	);

	codigoSalida = await playwrightProc.exited;
} finally {
	await Promise.all([
		detenerProceso(frontendProc),
		detenerProceso(backendProc),
	]);
}

process.exit(codigoSalida);
