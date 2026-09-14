-- CreateTable
CREATE TABLE "user" (
    "usr_id" SERIAL NOT NULL,
    "usr_email" VARCHAR(128) NOT NULL,
    "usr_nombre" VARCHAR(255) NOT NULL,
    "usr_password" VARCHAR(255) NOT NULL,
    "estatus" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("usr_id")
);

-- CreateTable
CREATE TABLE "rol" (
    "rol_id" SERIAL NOT NULL,
    "rol_nombre" VARCHAR(150) NOT NULL,
    "rol_descripcion" TEXT,
    "estatus" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "rol_pkey" PRIMARY KEY ("rol_id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "per_id" SERIAL NOT NULL,
    "per_recurso" VARCHAR(100) NOT NULL,
    "per_accion" VARCHAR(50) NOT NULL,
    "estatus" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("per_id")
);

-- CreateTable
CREATE TABLE "user_rol" (
    "usrrol_fkuser" INTEGER NOT NULL,
    "usrrol_fkrol" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_rol_pkey" PRIMARY KEY ("usrrol_fkuser","usrrol_fkrol")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "rolper_fkrol" INTEGER NOT NULL,
    "rolper_fkpermiso" INTEGER NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("rolper_fkrol","rolper_fkpermiso")
);

-- CreateTable
CREATE TABLE "user_permiso" (
    "usrper_fkuser" INTEGER NOT NULL,
    "usrper_fkpermiso" INTEGER NOT NULL,
    "usrper_concedido" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_permiso_pkey" PRIMARY KEY ("usrper_fkuser","usrper_fkpermiso")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_usr_email_key" ON "user"("usr_email");

-- CreateIndex
CREATE UNIQUE INDEX "rol_rol_nombre_key" ON "rol"("rol_nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_per_recurso_per_accion_key" ON "permiso"("per_recurso", "per_accion");

-- AddForeignKey
ALTER TABLE "user_rol" ADD CONSTRAINT "user_rol_usrrol_fkuser_fkey" FOREIGN KEY ("usrrol_fkuser") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rol" ADD CONSTRAINT "user_rol_usrrol_fkrol_fkey" FOREIGN KEY ("usrrol_fkrol") REFERENCES "rol"("rol_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rolper_fkrol_fkey" FOREIGN KEY ("rolper_fkrol") REFERENCES "rol"("rol_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rolper_fkpermiso_fkey" FOREIGN KEY ("rolper_fkpermiso") REFERENCES "permiso"("per_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permiso" ADD CONSTRAINT "user_permiso_usrper_fkuser_fkey" FOREIGN KEY ("usrper_fkuser") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permiso" ADD CONSTRAINT "user_permiso_usrper_fkpermiso_fkey" FOREIGN KEY ("usrper_fkpermiso") REFERENCES "permiso"("per_id") ON DELETE CASCADE ON UPDATE CASCADE;
