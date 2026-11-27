-- CreateTable
CREATE TABLE "ajuste" (
    "aju_clave" VARCHAR(100) NOT NULL,
    "aju_valor" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ajuste_pkey" PRIMARY KEY ("aju_clave")
);
