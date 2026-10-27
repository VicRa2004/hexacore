import { prisma } from "../src/core/config/prisma";
import bcrypt from "bcrypt";

async function main() {
	console.log("🌱 Iniciando el proceso de seed...");

	// ─── 1. Roles ───────────────────────────────────────────────────────────────
	const datosRoles = [
		{ nombre: "USUARIO", descripcion: "Usuario estándar del sistema" },
		{ nombre: "ADMIN", descripcion: "Administrador con acceso total" },
		{ nombre: "MOD", descripcion: "Moderador con acceso parcial" },
	];

	for (const rol of datosRoles) {
		await prisma.rol.upsert({
			where: { nombre: rol.nombre },
			update: { descripcion: rol.descripcion },
			create: rol,
		});
	}
	console.log("✅ Roles inicializados");

	// ─── 2. Permisos atómicos ────────────────────────────────────────────────────
	const datosPermisos = [
		{ recurso: "usuarios", accion: "crear" },
		{ recurso: "usuarios", accion: "leer" },
		{ recurso: "usuarios", accion: "actualizar" },
		{ recurso: "usuarios", accion: "eliminar" },
		{ recurso: "permisos", accion: "crear" },
		{ recurso: "permisos", accion: "leer" },
		{ recurso: "permisos", accion: "actualizar" },
		{ recurso: "permisos", accion: "eliminar" },
	];

	for (const p of datosPermisos) {
		await prisma.permiso.upsert({
			where: {
				recurso_accion: { recurso: p.recurso, accion: p.accion },
			},
			update: {},
			create: p,
		});
	}
	console.log("✅ Permisos atómicos inicializados");

	// ─── 3. Asignación de permisos a roles ──────────────────────────────────────
	const permisosPorRol: Record<string, { recurso: string; accion: string }[]> =
		{
			ADMIN: datosPermisos,
			MOD: [
				{ recurso: "usuarios", accion: "crear" },
				{ recurso: "usuarios", accion: "leer" },
				{ recurso: "usuarios", accion: "actualizar" },
			],
			USUARIO: [{ recurso: "usuarios", accion: "leer" }],
		};

	for (const [nombreRol, permisos] of Object.entries(permisosPorRol)) {
		const rol = await prisma.rol.findUnique({ where: { nombre: nombreRol } });
		if (!rol) continue;

		for (const p of permisos) {
			const permiso = await prisma.permiso.findUnique({
				where: {
					recurso_accion: { recurso: p.recurso, accion: p.accion },
				},
			});
			if (!permiso) continue;

			await prisma.rolPermiso.upsert({
				where: {
					rolId_permisoId: { rolId: rol.id, permisoId: permiso.id },
				},
				update: {},
				create: { rolId: rol.id, permisoId: permiso.id },
			});
		}
	}
	console.log("✅ Permisos asignados a roles");

	// ─── 4. Usuarios de prueba ───────────────────────────────────────────────────
	const passwordHash = await bcrypt.hash("SecurePass123!", 10);

	const datosUsuarios = [
		{
			email: "admin@dev.com",
			nombre: "Administrador",
			password: passwordHash,
			nombreRol: "ADMIN",
		},
		{
			email: "mod@dev.com",
			nombre: "Supermoderador",
			password: passwordHash,
			nombreRol: "MOD",
		},
		{
			email: "usuario@dev.com",
			nombre: "Usuario Estándar",
			password: passwordHash,
			nombreRol: "USUARIO",
		},
	];

	for (const { nombreRol, ...camposUsuario } of datosUsuarios) {
		const usuario = await prisma.usuario.upsert({
			where: { email: camposUsuario.email },
			update: {},
			create: camposUsuario,
		});

		const rol = await prisma.rol.findUnique({ where: { nombre: nombreRol } });
		if (!rol) continue;

		await prisma.usuarioRol.upsert({
			where: { usuarioId_rolId: { usuarioId: usuario.id, rolId: rol.id } },
			update: {},
			create: { usuarioId: usuario.id, rolId: rol.id },
		});
	}

	console.log(
		"✅ Usuarios de prueba creados (CONTRASEÑA PARA TODOS: SecurePass123!)",
	);
	console.log(
		"   - admin@dev.com (ADMIN) → todos los permisos (usuarios y permisos)",
	);
	console.log("   - mod@dev.com   (MOD)   → crear, leer, actualizar");
	console.log("   - usuario@dev.com  (USUARIO)  → solo leer");
}

main()
	.then(async () => {
		await prisma.$disconnect();
		console.log("🏁 Seed finalizado correctamente.");
	})
	.catch(async (e) => {
		console.error("❌ Error ejecutando seed:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
