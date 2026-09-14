import { prisma } from "../src/core/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Iniciando el proceso de seed...");

  // ─── 1. Roles ───────────────────────────────────────────────────────────────
  const rolesData = [
    { name: "USER", description: "Usuario estándar del sistema" },
    { name: "ADMIN", description: "Administrador con acceso total" },
    { name: "MOD", description: "Moderador con acceso parcial" },
  ];

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log("✅ Roles inicializados");

  // ─── 2. Permisos atómicos ────────────────────────────────────────────────────
  const permissionsData = [
    { resource: "users", action: "create" },
    { resource: "users", action: "read" },
    { resource: "users", action: "update" },
    { resource: "users", action: "delete" },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: {
        resource_action: { resource: perm.resource, action: perm.action },
      },
      update: {},
      create: perm,
    });
  }
  console.log("✅ Permisos atómicos inicializados");

  // ─── 3. Asignación de permisos a roles ──────────────────────────────────────
  const rolePermissionsMap: Record<
    string,
    { resource: string; action: string }[]
  > = {
    ADMIN: permissionsData,
    MOD: [
      { resource: "users", action: "create" },
      { resource: "users", action: "read" },
      { resource: "users", action: "update" },
    ],
    USER: [{ resource: "users", action: "read" }],
  };

  for (const [roleName, permissions] of Object.entries(rolePermissionsMap)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    for (const perm of permissions) {
      const permission = await prisma.permission.findUnique({
        where: {
          resource_action: { resource: perm.resource, action: perm.action },
        },
      });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
  console.log("✅ Permisos asignados a roles");

  // ─── 4. Usuarios de prueba ───────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("SecurePass123!", 10);

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

  for (const { roleName, ...userFields } of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userFields.email },
      update: {},
      create: userFields,
    });

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  }

  console.log(
    "✅ Usuarios de prueba creados (CONTRASEÑA PARA TODOS: SecurePass123!)",
  );
  console.log("   - admin@dev.com (ADMIN) → todos los permisos");
  console.log("   - mod@dev.com   (MOD)   → crear, leer, actualizar");
  console.log("   - user@dev.com  (USER)  → solo leer");
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
