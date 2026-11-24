-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "usr_totp_activado_en" TIMESTAMP(3),
ADD COLUMN     "usr_totp_secreto" VARCHAR(255),
ADD COLUMN     "usr_totp_ultimo_paso" INTEGER;

-- CreateTable
CREATE TABLE "codigo_recuperacion" (
    "cdr_id" SERIAL NOT NULL,
    "cdr_fkusuario" INTEGER NOT NULL,
    "cdr_codigo_hash" VARCHAR(64) NOT NULL,
    "cdr_usado_en" TIMESTAMP(3),
    "cdr_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigo_recuperacion_pkey" PRIMARY KEY ("cdr_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "codigo_recuperacion_cdr_fkusuario_cdr_codigo_hash_key" ON "codigo_recuperacion"("cdr_fkusuario", "cdr_codigo_hash");

-- AddForeignKey
ALTER TABLE "codigo_recuperacion" ADD CONSTRAINT "codigo_recuperacion_cdr_fkusuario_fkey" FOREIGN KEY ("cdr_fkusuario") REFERENCES "usuario"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;
