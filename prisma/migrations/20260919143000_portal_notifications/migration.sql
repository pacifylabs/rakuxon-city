-- CreateEnum
CREATE TYPE "portal_notification_kind" AS ENUM ('listing_approved', 'listing_rejected');

-- CreateTable
CREATE TABLE "portal_notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" "portal_notification_kind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portal_notifications_user_id_read_at_idx" ON "portal_notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "portal_notifications_user_id_created_at_idx" ON "portal_notifications"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "portal_notifications" ADD CONSTRAINT "portal_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing listers keep access; verification applies to new registrations.
UPDATE "users" SET "email_verified" = CURRENT_TIMESTAMP WHERE "role" = 'lister' AND "email_verified" IS NULL;
