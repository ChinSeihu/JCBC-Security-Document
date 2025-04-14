-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastModifiedAt" TEXT,
ADD COLUMN     "lastModifiedDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
