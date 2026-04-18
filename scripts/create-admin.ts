import { prisma } from "../src/core/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🛡️  Crear Nuevo Usuario Administrador\n");

  const args = process.argv.slice(2);
  let email = args[0] || prompt("Email del administrador: ");
  let name = args[1] || prompt("Nombre completo: ");
  let password = args[2] || prompt("Contraseña: ");

  if (!email || !name || !password) {
    console.log("❌ Error: Todos los campos son obligatorios.");
    process.exit(1);
  }

  try {
    // 1. Verificar si el rol ADMIN existe
    let role = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!role) {
      console.log("⚙️  El rol ADMIN no existe. Creándolo globalmente...");
      role = await prisma.role.create({
        data: {
          name: "ADMIN",
          description: "Administrador con acceso total",
        },
      });
    }

    // 2. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("❌ Error: Ya existe un usuario con ese email.");
      process.exit(1);
    }

    // 3. Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Crear el usuario y asignar el rol
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        roles: {
          create: {
            roleId: role.id,
          },
        },
      },
    });

    console.log(`\n✅ ¡Éxito! Usuario administrador creado correctamente.`);
    console.log(`   Email: ${user.email}`);
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
