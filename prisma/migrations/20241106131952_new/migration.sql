/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `AIFriend` table. All the data in the column will be lost.
  - Added the required column `avatar_id` to the `AIFriend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIFriend" DROP COLUMN "avatar_url",
ADD COLUMN     "avatar_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "favorite_avatars" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "interactions" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "about" TEXT NOT NULL DEFAULT '',
    "persona" TEXT NOT NULL DEFAULT '',
    "knowledge_base" TEXT NOT NULL DEFAULT '',
    "memory" JSONB,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Avatar_creator_id_idx" ON "Avatar"("creator_id");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFriend" ADD CONSTRAINT "AIFriend_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "Avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
