/*
  Warnings:

  - You are about to drop the column `quizResultId` on the `TestStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestStatus" DROP COLUMN "quizResultId",
ADD COLUMN     "quizResultIds" TEXT[];
