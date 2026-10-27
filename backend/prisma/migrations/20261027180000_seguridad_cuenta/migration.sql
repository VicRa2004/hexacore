-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "usr_bloqueado_hasta" TIMESTAMP(3),
ADD COLUMN     "usr_email_verificado_en" TIMESTAMP(3),
ADD COLUMN     "usr_intentos_fallidos" INTEGER NOT NULL DEFAULT 0;

-- Las cuentas anteriores a la verificación de email se dan por verificadas.
UPDATE "usuario" SET "usr_email_verificado_en" = CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "token_cuenta" (
    "tkc_id" SERIAL NOT NULL,
    "tkc_token_hash" VARCHAR(128) NOT NULL,
    "tkc_fkusuario" INTEGER NOT NULL,
    "tkc_tipo" VARCHAR(30) NOT NULL,
    "tkc_expira_en" TIMESTAMP(3) NOT NULL,
    "tkc_usado_en" TIMESTAMP(3),
    "tkc_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_cuenta_pkey" PRIMARY KEY ("tkc_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_cuenta_tkc_token_hash_key" ON "token_cuenta"("tkc_token_hash");

-- CreateIndex
CREATE INDEX "token_cuenta_tkc_fkusuario_tkc_tipo_idx" ON "token_cuenta"("tkc_fkusuario", "tkc_tipo");

-- AddForeignKey
ALTER TABLE "token_cuenta" ADD CONSTRAINT "token_cuenta_tkc_fkusuario_fkey" FOREIGN KEY ("tkc_fkusuario") REFERENCES "usuario"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;

