-- DropForeignKey
ALTER TABLE "rol_permiso" DROP CONSTRAINT "rol_permiso_rolper_fkpermiso_fkey";

-- DropForeignKey
ALTER TABLE "rol_permiso" DROP CONSTRAINT "rol_permiso_rolper_fkrol_fkey";

-- DropForeignKey
ALTER TABLE "user_permiso" DROP CONSTRAINT "user_permiso_usrper_fkpermiso_fkey";

-- DropForeignKey
ALTER TABLE "user_permiso" DROP CONSTRAINT "user_permiso_usrper_fkuser_fkey";

-- DropForeignKey
ALTER TABLE "user_rol" DROP CONSTRAINT "user_rol_usrrol_fkrol_fkey";

-- DropForeignKey
ALTER TABLE "user_rol" DROP CONSTRAINT "user_rol_usrrol_fkuser_fkey";

-- AddForeignKey
ALTER TABLE "user_rol" ADD CONSTRAINT "user_rol_usrrol_fkuser_fkey" FOREIGN KEY ("usrrol_fkuser") REFERENCES "user"("usr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rol" ADD CONSTRAINT "user_rol_usrrol_fkrol_fkey" FOREIGN KEY ("usrrol_fkrol") REFERENCES "rol"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rolper_fkrol_fkey" FOREIGN KEY ("rolper_fkrol") REFERENCES "rol"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rolper_fkpermiso_fkey" FOREIGN KEY ("rolper_fkpermiso") REFERENCES "permiso"("per_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permiso" ADD CONSTRAINT "user_permiso_usrper_fkuser_fkey" FOREIGN KEY ("usrper_fkuser") REFERENCES "user"("usr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permiso" ADD CONSTRAINT "user_permiso_usrper_fkpermiso_fkey" FOREIGN KEY ("usrper_fkpermiso") REFERENCES "permiso"("per_id") ON DELETE RESTRICT ON UPDATE CASCADE;
