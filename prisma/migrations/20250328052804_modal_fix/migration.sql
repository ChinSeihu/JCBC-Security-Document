/*
  Warnings:

  - You are about to drop the column `selectedOptions` on the `QuizAnswer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuesOption" ADD COLUMN     "quizAnswerId" TEXT;

-- AlterTable
ALTER TABLE "QuizAnswer" DROP COLUMN "selectedOptions";

-- AddForeignKey
ALTER TABLE "QuesOption" ADD CONSTRAINT "QuesOption_quizAnswerId_fkey" FOREIGN KEY ("quizAnswerId") REFERENCES "QuizAnswer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
