-- Lister portal: self-serve listings with admin moderation.

CREATE TYPE "lister_kind" AS ENUM ('agent', 'developer', 'landlord', 'owner');

CREATE TYPE "listing_moderation_status" AS ENUM (
  'not_required',
  'draft',
  'pending_review',
  'approved',
  'rejected'
);

ALTER TYPE "user_role" ADD VALUE 'lister';

CREATE TABLE "lister_profiles" (
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "organisation" TEXT,
    "lister_kind" "lister_kind" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lister_profiles_pkey" PRIMARY KEY ("user_id")
);

ALTER TABLE "lister_profiles" ADD CONSTRAINT "lister_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "listings" ADD COLUMN "submitted_by_user_id" TEXT,
ADD COLUMN "moderation_status" "listing_moderation_status" NOT NULL DEFAULT 'not_required',
ADD COLUMN "submitted_at" TIMESTAMP(3),
ADD COLUMN "reviewed_at" TIMESTAMP(3),
ADD COLUMN "reviewed_by_user_id" TEXT,
ADD COLUMN "rejection_reason" TEXT;

ALTER TABLE "listings" ADD CONSTRAINT "listings_submitted_by_user_id_fkey"
  FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "listings" ADD CONSTRAINT "listings_reviewed_by_user_id_fkey"
  FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "listings_moderation_status_submitted_at_idx"
  ON "listings"("moderation_status", "submitted_at");

CREATE INDEX "listings_submitted_by_user_id_idx"
  ON "listings"("submitted_by_user_id");
