import { prisma } from "../src/core/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Iniciando el proceso de seed...");

  // 1. Asegurar que los roles existan
  const roles = [
    { id: 1, name: "USER" },
    { id: 2, name: "ADMIN" },
    { id: 3, name: "MOD" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: role,
    });
  }
  console.log("✅ Roles inicializados");

  // 2. Crear usuarios de prueba con roles específicos
  const passwordHash = await bcrypt.hash("123456", 10);

  const usersData = [
    {
      email: "admin@dev.com",
      name: "Administrador",
      password: passwordHash,
      roleName: "ADMIN",
    },
    {
      email: "mod@dev.com",
      name: "Super Moderador",
      password: passwordHash,
      roleName: "MOD",
    },
    {
      email: "user@dev.com",
      name: "Usuario Estándar",
      password: passwordHash,
      roleName: "USER",
    },
  ];

  for (const userData of usersData) {
    const { roleName, ...userFields } = userData;
    await prisma.user.upsert({
      where: { email: userFields.email },
      update: {},
      create: {
        ...userFields,
        role: {
          connect: { name: roleName },
        },
      },
    });
  }

  console.log("✅ Usuarios de prueba creados (CONTRASEÑA PARA TODOS: 123456)");
  console.log("   - admin@dev.com (ADMIN)");
  console.log("   - mod@dev.com (MOD)");
  console.log("   - user@dev.com (USER)");
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
