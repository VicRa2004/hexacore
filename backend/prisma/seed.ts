/**
 * Seed mínimo: catálogo de roles, permisos y su asignación. Idempotente y seguro
 * en cualquier entorno (lo cargan los e2e y `prisma migrate`). Los usuarios de
 * prueba y los datos de ejemplo están en `seed-demo.ts`.
 */
import { prisma } from "../src/core/config/prisma";

export async function sembrarCatalogo() {
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
		{ recurso: "roles", accion: "crear" },
		{ recurso: "roles", accion: "leer" },
		{ recurso: "roles", accion: "actualizar" },
		{ recurso: "roles", accion: "eliminar" },
		{ recurso: "asignaciones", accion: "leer" },
		{ recurso: "asignaciones", accion: "actualizar" },
		{ recurso: "auditoria", accion: "leer" },
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
}

if (import.meta.main) {
	sembrarCatalogo()
		.then(async () => {
			await prisma.$disconnect();
			console.log("🏁 Seed finalizado correctamente.");
		})
		.catch(async (e) => {
			console.error("❌ Error ejecutando seed:", e);
			await prisma.$disconnect();
			process.exit(1);
		});
}
