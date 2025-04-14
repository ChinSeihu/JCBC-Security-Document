/*
  Warnings:

  - You are about to drop the column `quizAnswerId` on the `QuesOption` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuesOption" DROP CONSTRAINT "QuesOption_quizAnswerId_fkey";

-- AlterTable
ALTER TABLE "QuesOption" DROP COLUMN "quizAnswerId";

-- AlterTable
ALTER TABLE "QuizAnswer" ADD COLUMN     "selectedOptions" INTEGER[];
