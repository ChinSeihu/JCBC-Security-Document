/*
  Warnings:

  - A unique constraint covering the columns `[theme]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `theme` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "theme" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Document_theme_key" ON "Document"("theme");
