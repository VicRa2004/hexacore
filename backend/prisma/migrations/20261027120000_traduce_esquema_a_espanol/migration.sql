-- Vuelve el esquema al español: renombra tablas, columnas, claves e índices
-- conservando los datos. Al final traduce los roles y permisos del seed.

-- user -> usuario
ALTER TABLE "user" RENAME TO "usuario";
ALTER TABLE "usuario" RENAME COLUMN "usr_name" TO "usr_nombre";
ALTER TABLE "usuario" RENAME COLUMN "is_active" TO "is_activo";
ALTER TABLE "usuario" RENAME CONSTRAINT "user_pkey" TO "usuario_pkey";
ALTER INDEX "user_usr_email_key" RENAME TO "usuario_usr_email_key";
ALTER SEQUENCE IF EXISTS "user_usr_id_seq" RENAME TO "usuario_usr_id_seq";

-- role -> rol
ALTER TABLE "role" RENAME TO "rol";
ALTER TABLE "rol" RENAME COLUMN "role_id" TO "rol_id";
ALTER TABLE "rol" RENAME COLUMN "role_name" TO "rol_nombre";
ALTER TABLE "rol" RENAME COLUMN "role_description" TO "rol_descripcion";
ALTER TABLE "rol" RENAME COLUMN "is_active" TO "is_activo";
ALTER TABLE "rol" RENAME CONSTRAINT "role_pkey" TO "rol_pkey";
ALTER INDEX "role_role_name_key" RENAME TO "rol_rol_nombre_key";

-- permission -> permiso
ALTER TABLE "permission" RENAME TO "permiso";
ALTER TABLE "permiso" RENAME COLUMN "permission_id" TO "per_id";
ALTER TABLE "permiso" RENAME COLUMN "per_resource" TO "per_recurso";
ALTER TABLE "permiso" RENAME COLUMN "per_action" TO "per_accion";
ALTER TABLE "permiso" RENAME COLUMN "is_active" TO "is_activo";
ALTER TABLE "permiso" RENAME CONSTRAINT "permission_pkey" TO "permiso_pkey";
ALTER INDEX "permission_per_resource_per_action_key" RENAME TO "permiso_per_recurso_per_accion_key";

-- user_role -> usuario_rol
ALTER TABLE "user_role" RENAME TO "usuario_rol";
ALTER TABLE "usuario_rol" RENAME COLUMN "usrrol_fkuser" TO "usrrol_fkusuario";
ALTER TABLE "usuario_rol" RENAME COLUMN "usrrol_fkrole" TO "usrrol_fkrol";
ALTER TABLE "usuario_rol" RENAME CONSTRAINT "user_role_pkey" TO "usuario_rol_pkey";
ALTER TABLE "usuario_rol" RENAME CONSTRAINT "user_role_usrrol_fkuser_fkey" TO "usuario_rol_usrrol_fkusuario_fkey";
ALTER TABLE "usuario_rol" RENAME CONSTRAINT "user_role_usrrol_fkrole_fkey" TO "usuario_rol_usrrol_fkrol_fkey";

-- role_permission -> rol_permiso
ALTER TABLE "role_permission" RENAME TO "rol_permiso";
ALTER TABLE "rol_permiso" RENAME COLUMN "rolper_fkrole" TO "rolper_fkrol";
ALTER TABLE "rol_permiso" RENAME COLUMN "rolper_fkpermission" TO "rolper_fkpermiso";
ALTER TABLE "rol_permiso" RENAME CONSTRAINT "role_permission_pkey" TO "rol_permiso_pkey";
ALTER TABLE "rol_permiso" RENAME CONSTRAINT "role_permission_rolper_fkrole_fkey" TO "rol_permiso_rolper_fkrol_fkey";
ALTER TABLE "rol_permiso" RENAME CONSTRAINT "role_permission_rolper_fkpermission_fkey" TO "rol_permiso_rolper_fkpermiso_fkey";

-- user_permission -> usuario_permiso
ALTER TABLE "user_permission" RENAME TO "usuario_permiso";
ALTER TABLE "usuario_permiso" RENAME COLUMN "usrper_fkuser" TO "usrper_fkusuario";
ALTER TABLE "usuario_permiso" RENAME COLUMN "usrper_fkpermission" TO "usrper_fkpermiso";
ALTER TABLE "usuario_permiso" RENAME COLUMN "usrper_granted" TO "usrper_concedido";
ALTER TABLE "usuario_permiso" RENAME CONSTRAINT "user_permission_pkey" TO "usuario_permiso_pkey";
ALTER TABLE "usuario_permiso" RENAME CONSTRAINT "user_permission_usrper_fkuser_fkey" TO "usuario_permiso_usrper_fkusuario_fkey";
ALTER TABLE "usuario_permiso" RENAME CONSTRAINT "user_permission_usrper_fkpermission_fkey" TO "usuario_permiso_usrper_fkpermiso_fkey";

-- refresh_token (la tabla conserva el nombre)
ALTER TABLE "refresh_token" RENAME COLUMN "rft_fkuser" TO "rft_fkusuario";
ALTER TABLE "refresh_token" RENAME COLUMN "rft_expires_at" TO "rft_expira_en";
ALTER TABLE "refresh_token" RENAME COLUMN "rft_revoked" TO "rft_revocado";
ALTER TABLE "refresh_token" RENAME CONSTRAINT "refresh_token_rft_fkuser_fkey" TO "refresh_token_rft_fkusuario_fkey";
ALTER INDEX "refresh_token_rft_fkuser_idx" RENAME TO "refresh_token_rft_fkusuario_idx";

-- Datos del seed: rol por defecto y catálogo de permisos
UPDATE "rol" SET "rol_nombre" = 'USUARIO' WHERE "rol_nombre" = 'USER';
UPDATE "permiso" SET "per_recurso" = 'usuarios' WHERE "per_recurso" = 'users';
UPDATE "permiso" SET "per_recurso" = 'permisos' WHERE "per_recurso" = 'permissions';
UPDATE "permiso" SET "per_accion" = CASE "per_accion"
    WHEN 'create' THEN 'crear'
    WHEN 'read' THEN 'leer'
    WHEN 'update' THEN 'actualizar'
    WHEN 'delete' THEN 'eliminar'
    ELSE "per_accion"
END;
