-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_usrrol_fkuser_fkey";

-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_rolper_fkrole_fkey";

-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_rolper_fkpermission_fkey";

-- DropForeignKey
ALTER TABLE "user_permission" DROP CONSTRAINT "user_permission_usrper_fkuser_fkey";

-- DropForeignKey
ALTER TABLE "user_permission" DROP CONSTRAINT "user_permission_usrper_fkpermission_fkey";

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_usrrol_fkuser_fkey" FOREIGN KEY ("usrrol_fkuser") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_rolper_fkrole_fkey" FOREIGN KEY ("rolper_fkrole") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_rolper_fkpermission_fkey" FOREIGN KEY ("rolper_fkpermission") REFERENCES "permission"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_usrper_fkuser_fkey" FOREIGN KEY ("usrper_fkuser") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_usrper_fkpermission_fkey" FOREIGN KEY ("usrper_fkpermission") REFERENCES "permission"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;
