-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role_id" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- Insert Default Roles
INSERT INTO "roles" ("id", "name") VALUES (1, 'USER');
INSERT INTO "roles" ("id", "name") VALUES (2, 'ADMIN');


-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
