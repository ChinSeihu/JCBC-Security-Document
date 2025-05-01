/*
  Warnings:

  - The primary key for the `TestStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `quizResultId` column on the `TestStatus` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The required column `id` was added to the `TestStatus` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "TestStatus" DROP CONSTRAINT "TestStatus_quizResultId_fkey";

-- AlterTable
ALTER TABLE "QuizResult" ADD COLUMN     "testStatusId" TEXT;

-- AlterTable
ALTER TABLE "TestStatus" DROP CONSTRAINT "TestStatus_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
DROP COLUMN "quizResultId",
ADD COLUMN     "quizResultId" TEXT[],
ADD CONSTRAINT "TestStatus_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_testStatusId_fkey" FOREIGN KEY ("testStatusId") REFERENCES "TestStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
