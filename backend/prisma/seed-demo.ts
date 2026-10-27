/**
 * Seed de demo, solo para desarrollo: catálogo + usuarios de prueba con
 * contraseña conocida + usuarios de ejemplo para ver la paginación.
 * Uso: `pnpm db:seed:demo`. Nunca en producción (allí: scripts/create-admin.ts).
 */
import bcrypt from "bcrypt";
import { prisma } from "../src/core/config/prisma";
import { sembrarCatalogo } from "./seed";

const PASSWORD = "SecurePass123!";

const usuariosDePrueba = [
	{ email: "admin@dev.com", nombre: "Administrador", rol: "ADMIN" },
	{ email: "mod@dev.com", nombre: "Supermoderador", rol: "MOD" },
	{ email: "usuario@dev.com", nombre: "Usuario Estándar", rol: "USUARIO" },
];

const nombres = [
	"Ana",
	"Luis",
	"Marta",
	"Jorge",
	"Lucía",
	"Pablo",
	"Elena",
	"Diego",
	"Sara",
	"Hugo",
	"Irene",
	"Raúl",
];
const apellidos = [
	"García",
	"Martínez",
	"López",
	"Sánchez",
	"Romero",
	"Navarro",
];
const usuariosDeEjemplo = Array.from({ length: 24 }, (_, i) => {
	const nombre = `${nombres[i % nombres.length]} ${apellidos[i % apellidos.length]}`;
	return {
		email: `ejemplo${i + 1}@demo.dev`,
		nombre,
		rol: i % 8 === 0 ? "MOD" : "USUARIO",
		// Algunos inactivos y sin verificar, para ver esos estados en la UI.
		isActivo: i % 7 !== 3,
		emailVerificadoEn: i % 5 === 2 ? null : new Date(),
	};
});

async function main() {
	if (process.env.NODE_ENV === "prod") {
		throw new Error(
			"seed-demo crea usuarios con contraseña conocida: no se ejecuta en producción",
		);
	}
	await sembrarCatalogo();

	const password = await bcrypt.hash(PASSWORD, 10);
	const roles = new Map(
		(await prisma.rol.findMany()).map((r) => [r.nombre, r.id]),
	);

	for (const { rol, ...datos } of [
		...usuariosDePrueba.map((u) => ({
			...u,
			isActivo: true,
			emailVerificadoEn: new Date(),
		})),
		...usuariosDeEjemplo,
	]) {
		const rolId = roles.get(rol);
		if (!rolId)
			throw new Error(`Falta el rol ${rol}: ¿falló el seed del catálogo?`);
		await prisma.usuario.upsert({
			where: { email: datos.email },
			update: {},
			create: { ...datos, password, roles: { create: { rolId } } },
		});
	}

	console.log(`✅ Usuarios de demo (contraseña para todos: ${PASSWORD})`);
	console.log("   - admin@dev.com    (ADMIN)   → todos los permisos");
	console.log("   - mod@dev.com      (MOD)     → crear, leer, actualizar");
	console.log("   - usuario@dev.com  (USUARIO) → solo leer");
	console.log(
		`   - ${usuariosDeEjemplo.length} usuarios de ejemplo (ejemploN@demo.dev)`,
	);
}

main()
	.then(() => prisma.$disconnect())
	.catch(async (e) => {
		console.error("❌ Error ejecutando el seed de demo:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
