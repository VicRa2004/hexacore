-- CreateTable
CREATE TABLE "notificacion" (
    "not_id" SERIAL NOT NULL,
    "not_fkusuario" INTEGER NOT NULL,
    "not_tipo" VARCHAR(100) NOT NULL,
    "not_datos" JSONB NOT NULL,
    "not_leida_en" TIMESTAMP(3),
    "not_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("not_id")
);

-- CreateIndex
CREATE INDEX "notificacion_not_fkusuario_not_leida_en_not_created_at_idx" ON "notificacion"("not_fkusuario", "not_leida_en", "not_created_at");

-- CreateIndex
CREATE INDEX "notificacion_not_created_at_idx" ON "notificacion"("not_created_at");

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_not_fkusuario_fkey" FOREIGN KEY ("not_fkusuario") REFERENCES "usuario"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;
