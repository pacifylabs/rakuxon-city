-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "attribution" TEXT,
ADD COLUMN     "is_stand_in" BOOLEAN NOT NULL DEFAULT false;
