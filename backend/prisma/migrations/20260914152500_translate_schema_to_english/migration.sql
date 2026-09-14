-- AlterTable user: rename Spanish columns to English
ALTER TABLE "user" RENAME COLUMN "usr_nombre" TO "usr_name";
ALTER TABLE "user" RENAME COLUMN "estatus" TO "is_active";

-- Rename Table rol -> role and its columns
ALTER TABLE "rol" RENAME TO "role";
ALTER TABLE "role" RENAME COLUMN "rol_id" TO "role_id";
ALTER TABLE "role" RENAME COLUMN "rol_nombre" TO "role_name";
ALTER TABLE "role" RENAME COLUMN "rol_descripcion" TO "role_description";
ALTER TABLE "role" RENAME COLUMN "estatus" TO "is_active";
ALTER TABLE "role" RENAME CONSTRAINT "rol_pkey" TO "role_pkey";
ALTER INDEX IF EXISTS "rol_rol_nombre_key" RENAME TO "role_role_name_key";

-- Rename Table permiso -> permission and its columns
ALTER TABLE "permiso" RENAME TO "permission";
ALTER TABLE "permission" RENAME COLUMN "per_id" TO "permission_id";
ALTER TABLE "permission" RENAME COLUMN "per_recurso" TO "per_resource";
ALTER TABLE "permission" RENAME COLUMN "per_accion" TO "per_action";
ALTER TABLE "permission" RENAME COLUMN "estatus" TO "is_active";
ALTER TABLE "permission" RENAME CONSTRAINT "permiso_pkey" TO "permission_pkey";
ALTER INDEX IF EXISTS "permiso_per_recurso_per_accion_key" RENAME TO "permission_per_resource_per_action_key";

-- Rename Table user_rol -> user_role and foreign keys
ALTER TABLE "user_rol" RENAME TO "user_role";
ALTER TABLE "user_role" RENAME COLUMN "usrrol_fkrol" TO "usrrol_fkrole";
ALTER TABLE "user_role" RENAME CONSTRAINT "user_rol_pkey" TO "user_role_pkey";
ALTER TABLE "user_role" RENAME CONSTRAINT "user_rol_usrrol_fkuser_fkey" TO "user_role_usrrol_fkuser_fkey";
ALTER TABLE "user_role" RENAME CONSTRAINT "user_rol_usrrol_fkrol_fkey" TO "user_role_usrrol_fkrole_fkey";

-- Rename Table rol_permiso -> role_permission and foreign keys
ALTER TABLE "rol_permiso" RENAME TO "role_permission";
ALTER TABLE "role_permission" RENAME COLUMN "rolper_fkrol" TO "rolper_fkrole";
ALTER TABLE "role_permission" RENAME COLUMN "rolper_fkpermiso" TO "rolper_fkpermission";
ALTER TABLE "role_permission" RENAME CONSTRAINT "rol_permiso_pkey" TO "role_permission_pkey";
ALTER TABLE "role_permission" RENAME CONSTRAINT "rol_permiso_rolper_fkrol_fkey" TO "role_permission_rolper_fkrole_fkey";
ALTER TABLE "role_permission" RENAME CONSTRAINT "rol_permiso_rolper_fkpermiso_fkey" TO "role_permission_rolper_fkpermission_fkey";

-- Rename Table user_permiso -> user_permission and foreign keys
ALTER TABLE "user_permiso" RENAME TO "user_permission";
ALTER TABLE "user_permission" RENAME COLUMN "usrper_fkpermiso" TO "usrper_fkpermission";
ALTER TABLE "user_permission" RENAME COLUMN "usrper_concedido" TO "usrper_granted";
ALTER TABLE "user_permission" RENAME CONSTRAINT "user_permiso_pkey" TO "user_permission_pkey";
ALTER TABLE "user_permission" RENAME CONSTRAINT "user_permiso_usrper_fkuser_fkey" TO "user_permission_usrper_fkuser_fkey";
ALTER TABLE "user_permission" RENAME CONSTRAINT "user_permiso_usrper_fkpermiso_fkey" TO "user_permission_usrper_fkpermission_fkey";
