-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "usr_avatar" VARCHAR(255);

-- CreateTable
CREATE TABLE "evento_outbox" (
    "evo_id" SERIAL NOT NULL,
    "evo_nombre" VARCHAR(150) NOT NULL,
    "evo_datos" JSONB NOT NULL,
    "evo_ocurrido_en" TIMESTAMP(3) NOT NULL,
    "evo_request_id" VARCHAR(100),
    "evo_usuario_id" INTEGER,
    "evo_procesado_en" TIMESTAMP(3),
    "evo_reservado_hasta" TIMESTAMP(3),
    "evo_intentos" INTEGER NOT NULL DEFAULT 0,
    "evo_ultimo_error" TEXT,

    CONSTRAINT "evento_outbox_pkey" PRIMARY KEY ("evo_id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "aud_id" SERIAL NOT NULL,
    "aud_evento" VARCHAR(150) NOT NULL,
    "aud_datos" JSONB NOT NULL,
    "aud_usuario_id" INTEGER,
    "aud_request_id" VARCHAR(100),
    "aud_ocurrido_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("aud_id")
);

-- CreateIndex
CREATE INDEX "evento_outbox_evo_procesado_en_evo_id_idx" ON "evento_outbox"("evo_procesado_en", "evo_id");

-- CreateIndex
CREATE INDEX "auditoria_aud_ocurrido_en_idx" ON "auditoria"("aud_ocurrido_en");

-- CreateIndex
CREATE INDEX "auditoria_aud_evento_idx" ON "auditoria"("aud_evento");

