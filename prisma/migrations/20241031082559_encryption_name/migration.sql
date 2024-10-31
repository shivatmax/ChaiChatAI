/*
  Warnings:

  - You are about to drop the column `email_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `encrypted_email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `encrypted_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_hash_key";

-- DropIndex
DROP INDEX "User_encrypted_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_hash",
DROP COLUMN "encrypted_email",
DROP COLUMN "encrypted_name",
DROP COLUMN "iv",
DROP COLUMN "salt",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
