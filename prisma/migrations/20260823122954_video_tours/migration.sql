-- CreateEnum
CREATE TYPE "video_kind" AS ENUM ('DRONE_TOUR', 'WALKTHROUGH', 'ESTATE_OVERVIEW', 'PROGRESS_UPDATE', 'TESTIMONIAL');

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "youtube_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "video_kind" NOT NULL,
    "poster_media_id" TEXT,
    "duration_seconds" INTEGER,
    "listing_id" TEXT,
    "estate_id" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_slug_key" ON "videos"("slug");

-- CreateIndex
CREATE INDEX "videos_featured_sort_order_idx" ON "videos"("featured", "sort_order");

-- CreateIndex
CREATE INDEX "videos_listing_id_idx" ON "videos"("listing_id");

-- CreateIndex
CREATE INDEX "videos_estate_id_idx" ON "videos"("estate_id");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_poster_media_id_fkey" FOREIGN KEY ("poster_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 06_FEATURE_VIDEO_TOURS.md §3: "a Video row must have exactly one of
-- listingId or estateId populated". Enforced in the database as well as the
-- application, because the CSV importer and the Phase 7 admin both write here
-- and an orphaned video renders nowhere while still counting toward the
-- homepage's two-video threshold.
ALTER TABLE "videos"
  ADD CONSTRAINT "videos_exactly_one_parent"
  CHECK (("listing_id" IS NULL) <> ("estate_id" IS NULL));
