/*
  Warnings:

  - You are about to drop the column `questionId` on the `QuizResult` table. All the data in the column will be lost.
  - You are about to drop the `SelectedOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `documentId` to the `QuizResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuizResult" DROP CONSTRAINT "QuizResult_questionId_fkey";

-- DropForeignKey
ALTER TABLE "SelectedOption" DROP CONSTRAINT "SelectedOption_optionId_fkey";

-- DropForeignKey
ALTER TABLE "SelectedOption" DROP CONSTRAINT "SelectedOption_userAnswerId_fkey";

-- AlterTable
ALTER TABLE "QuizAnswer" ADD COLUMN     "selectedOptions" TEXT[];

-- AlterTable
ALTER TABLE "QuizResult" DROP COLUMN "questionId",
ADD COLUMN     "documentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "SelectedOption";

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
