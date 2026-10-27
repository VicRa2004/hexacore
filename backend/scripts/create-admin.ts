import { prisma } from "../src/core/config/prisma";
import bcrypt from "bcrypt";

async function main() {
	console.log("🛡️  Crear Nuevo Usuario Administrador\n");

	const args = process.argv.slice(2);
	const email = args[0] || prompt("Email del administrador: ");
	const nombre = args[1] || prompt("Nombre completo: ");
	const password = args[2] || prompt("Contraseña: ");

	if (!email || !nombre || !password) {
		console.log("❌ Error: Todos los campos son obligatorios.");
		process.exit(1);
	}

	try {
		// 1. Verificar si el rol ADMIN existe
		let rol = await prisma.rol.findUnique({ where: { nombre: "ADMIN" } });
		if (!rol) {
			console.log("⚙️  El rol ADMIN no existe. Creándolo globalmente...");
			rol = await prisma.rol.create({
				data: {
					nombre: "ADMIN",
					descripcion: "Administrador con acceso total",
				},
			});
		}

		// 2. Verificar si el usuario ya existe
		const usuarioExistente = await prisma.usuario.findUnique({
			where: { email },
		});
		if (usuarioExistente) {
			console.log("❌ Error: Ya existe un usuario con ese email.");
			process.exit(1);
		}

		// 3. Hashear la contraseña
		const passwordHash = await bcrypt.hash(password, 10);

		// 4. Crear el usuario y asignar el rol
		const usuario = await prisma.usuario.create({
			data: {
				email,
				nombre,
				password: passwordHash,
				roles: {
					create: {
						rolId: rol.id,
					},
				},
			},
		});

		console.log(`\n✅ ¡Éxito! Usuario administrador creado correctamente.`);
		console.log(`   Email: ${usuario.email}`);
		console.log(`   Rol:   ADMIN`);
	} catch (error) {
		console.error("❌ Error inesperado creando administrador:", error);
		process.exit(1);
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
		process.exit(0);
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
