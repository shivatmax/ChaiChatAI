/*
  Warnings:

  - You are about to drop the column `TodaysSummary` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "TodaysSummary",
ADD COLUMN     "todaysSummary" BOOLEAN NOT NULL DEFAULT true;
