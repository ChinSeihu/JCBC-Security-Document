/*
  Warnings:

  - You are about to drop the `DocumentStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentStatus" DROP CONSTRAINT "DocumentStatus_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentStatus" DROP CONSTRAINT "DocumentStatus_userId_fkey";

-- DropTable
DROP TABLE "DocumentStatus";

-- CreateTable
CREATE TABLE "TestStatus" (
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "quizResultId" TEXT,

    CONSTRAINT "TestStatus_pkey" PRIMARY KEY ("userId","documentId")
);

-- AddForeignKey
ALTER TABLE "TestStatus" ADD CONSTRAINT "TestStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestStatus" ADD CONSTRAINT "TestStatus_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestStatus" ADD CONSTRAINT "TestStatus_quizResultId_fkey" FOREIGN KEY ("quizResultId") REFERENCES "QuizResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
