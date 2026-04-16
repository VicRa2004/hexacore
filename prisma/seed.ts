import { prisma } from "../src/core/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Iniciando el proceso de seed...");

  // ─── 1. Roles ───────────────────────────────────────────────────────────────
  const rolesData = [
    { id: 1, name: "USER" },
    { id: 2, name: "ADMIN" },
    { id: 3, name: "MOD" },
  ];

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: role,
    });
  }
  console.log("✅ Roles inicializados");

  // ─── 2. Permisos atómicos ────────────────────────────────────────────────────
  // Define aquí todos los permisos del sistema.
  // Formato: { resource: "nombre-recurso", action: "crud-action" }
  const permissionsData = [
    // Recurso: users
    { resource: "users", action: "create" },
    { resource: "users", action: "read" },
    { resource: "users", action: "update" },
    { resource: "users", action: "delete" },
    // Recurso: turnos (ejemplo futuro)
    { resource: "turnos", action: "create" },
    { resource: "turnos", action: "read" },
    { resource: "turnos", action: "update" },
    { resource: "turnos", action: "delete" },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
  }
  console.log("✅ Permisos atómicos inicializados");

  // ─── 3. Asignación de permisos a roles ──────────────────────────────────────
  // ADMIN → todos los permisos
  // MOD   → crear, leer y actualizar (NO eliminar)
  // USER  → solo leer sus propios datos (read)
  const rolePermissionsMap: Record<string, { resource: string; action: string }[]> = {
    ADMIN: permissionsData, // Todos los permisos
    MOD: [
      { resource: "users", action: "create" },
      { resource: "users", action: "read" },
      { resource: "users", action: "update" },
      { resource: "turnos", action: "create" },
      { resource: "turnos", action: "read" },
      { resource: "turnos", action: "update" },
    ],
    USER: [
      { resource: "users", action: "read" },
      { resource: "turnos", action: "read" },
      { resource: "turnos", action: "create" },
    ],
  };

  for (const [roleName, permissions] of Object.entries(rolePermissionsMap)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    for (const perm of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { resource_action: { resource: perm.resource, action: perm.action } },
      });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
  console.log("✅ Permisos asignados a roles");

  // ─── 4. Usuarios de prueba con sus roles (nuevo esquema N-a-N) ──────────────
  const passwordHash = await bcrypt.hash("123456", 10);

  const usersData = [
    { email: "admin@dev.com", name: "Administrador",    password: passwordHash, roleName: "ADMIN" },
    { email: "mod@dev.com",   name: "Super Moderador",  password: passwordHash, roleName: "MOD" },
    { email: "user@dev.com",  name: "Usuario Estándar", password: passwordHash, roleName: "USER" },
  ];

  for (const { roleName, ...userFields } of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userFields.email },
      update: {},
      create: userFields,
    });

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    // Conectar usuario ↔ rol en la tabla intermedia user_roles
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  }

  console.log("✅ Usuarios de prueba creados (CONTRASEÑA PARA TODOS: 123456)");
  console.log("   - admin@dev.com (ADMIN) → todos los permisos");
  console.log("   - mod@dev.com (MOD)     → crear, leer, actualizar");
  console.log("   - user@dev.com (USER)   → solo leer");
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

