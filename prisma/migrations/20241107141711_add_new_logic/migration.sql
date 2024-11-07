/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `AIFriend` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AIFriend" DROP COLUMN "avatar_url",
ADD COLUMN     "is_original" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_uses" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "original_id" TEXT;
