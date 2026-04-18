-- CreateTable
CREATE TABLE "refresh_token" (
    "rft_id" SERIAL NOT NULL,
    "rft_token_hash" VARCHAR(512) NOT NULL,
    "rft_fkuser" INTEGER NOT NULL,
    "rft_expires_at" TIMESTAMP(3) NOT NULL,
    "rft_revoked" BOOLEAN NOT NULL DEFAULT false,
    "rft_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("rft_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_rft_token_hash_key" ON "refresh_token"("rft_token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_rft_fkuser_idx" ON "refresh_token"("rft_fkuser");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_rft_fkuser_fkey" FOREIGN KEY ("rft_fkuser") REFERENCES "user"("usr_id") ON DELETE CASCADE ON UPDATE CASCADE;
