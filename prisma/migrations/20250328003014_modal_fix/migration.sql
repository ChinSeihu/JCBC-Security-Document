-- DropForeignKey
ALTER TABLE "QuizResult" DROP CONSTRAINT "QuizResult_documentId_fkey";

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
