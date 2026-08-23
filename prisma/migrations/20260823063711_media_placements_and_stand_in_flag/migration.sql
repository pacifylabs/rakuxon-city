-- AlterTable
ALTER TABLE "media" ADD COLUMN     "attribution" TEXT,
ADD COLUMN     "is_stand_in" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source_url" TEXT;

-- CreateTable
CREATE TABLE "media_placements" (
    "key" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "guidance" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_placements_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "media_placements" ADD CONSTRAINT "media_placements_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
