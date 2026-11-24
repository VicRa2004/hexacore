-- CreateTable
CREATE TABLE "cuenta_oauth" (
    "cto_id" SERIAL NOT NULL,
    "cto_fkusuario" INTEGER NOT NULL,
    "cto_proveedor" VARCHAR(30) NOT NULL,
    "cto_id_externo" VARCHAR(255) NOT NULL,
    "cto_email" VARCHAR(128),
    "cto_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuenta_oauth_pkey" PRIMARY KEY ("cto_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuenta_oauth_cto_proveedor_cto_id_externo_key" ON "cuenta_oauth"("cto_proveedor", "cto_id_externo");

-- CreateIndex
CREATE UNIQUE INDEX "cuenta_oauth_cto_fkusuario_cto_proveedor_key" ON "cuenta_oauth"("cto_fkusuario", "cto_proveedor");

-- AddForeignKey
ALTER TABLE "cuenta_oauth" ADD CONSTRAINT "cuenta_oauth_cto_fkusuario_fkey" FOREIGN KEY ("cto_fkusuario") REFERENCES "usuario"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;
