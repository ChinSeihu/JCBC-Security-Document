/*
  Warnings:

  - Made the column `createdAt` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_createdAt_fkey";

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "createdAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdAt_fkey" FOREIGN KEY ("createdAt") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
