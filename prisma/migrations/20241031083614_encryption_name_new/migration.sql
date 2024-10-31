/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email_hash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email_hash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encrypted_email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encrypted_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryption_key` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryption_salt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "email_hash" TEXT NOT NULL,
ADD COLUMN     "encrypted_email" TEXT NOT NULL,
ADD COLUMN     "encrypted_name" TEXT NOT NULL,
ADD COLUMN     "encryption_key" TEXT NOT NULL,
ADD COLUMN     "encryption_salt" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL,
ADD COLUMN     "tag" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_hash_key" ON "User"("email_hash");
