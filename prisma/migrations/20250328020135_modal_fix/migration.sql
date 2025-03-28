/*
  Warnings:

  - A unique constraint covering the columns `[userId,documentId]` on the table `TestStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TestStatus_userId_documentId_key" ON "TestStatus"("userId", "documentId");
