-- CreateEnum
CREATE TYPE "listing_type" AS ENUM ('land', 'home');

-- CreateEnum
CREATE TYPE "listing_status" AS ENUM ('draft', 'available', 'reserved', 'sold');

-- CreateEnum
CREATE TYPE "title_type" AS ENUM ('c_of_o', 'governors_consent', 'gazette', 'deed_of_assignment', 'excision', 'survey_only');

-- CreateEnum
CREATE TYPE "plot_unit" AS ENUM ('sqm', 'plots', 'acres', 'hectares');

-- CreateEnum
CREATE TYPE "house_type" AS ENUM ('detached', 'semi_detached', 'terrace', 'bungalow', 'duplex', 'apartment');

-- CreateEnum
CREATE TYPE "build_stage" AS ENUM ('off_plan', 'under_construction', 'completed');

-- CreateEnum
CREATE TYPE "estate_status" AS ENUM ('active', 'sold_out', 'delivered');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'sales', 'investor_manager');

-- CreateEnum
CREATE TYPE "sales_track" AS ENUM ('land', 'homes', 'both');

-- CreateEnum
CREATE TYPE "enquiry_track" AS ENUM ('land', 'homes');

-- CreateEnum
CREATE TYPE "enquiry_source" AS ENUM ('listing', 'contact', 'resource', 'campaign', 'general');

-- CreateEnum
CREATE TYPE "enquiry_status" AS ENUM ('new', 'contacted', 'qualified', 'closed');

-- CreateEnum
CREATE TYPE "article_category" AS ENUM ('title_and_documentation', 'buying_process', 'payment_plans', 'estate_living');

-- CreateEnum
CREATE TYPE "article_status" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "sales_track" "sales_track",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "description" TEXT NOT NULL,
    "amenities" TEXT[],
    "status" "estate_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estate_media" (
    "estate_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "estate_media_pkey" PRIMARY KEY ("estate_id","media_id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "listing_type" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estate_id" TEXT,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "price" DECIMAL(14,2),
    "price_on_request" BOOLEAN NOT NULL DEFAULT false,
    "status" "listing_status" NOT NULL DEFAULT 'draft',
    "payment_plan_available" BOOLEAN NOT NULL DEFAULT false,
    "payment_plan_terms" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_media" (
    "listing_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "listing_media_pkey" PRIMARY KEY ("listing_id","media_id")
);

-- CreateTable
CREATE TABLE "land_details" (
    "listing_id" TEXT NOT NULL,
    "plot_size" DECIMAL(12,2) NOT NULL,
    "plot_unit" "plot_unit" NOT NULL,
    "title_type" "title_type" NOT NULL,
    "survey_number" TEXT,
    "topography" TEXT,
    "road_access" TEXT,

    CONSTRAINT "land_details_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "land_documents" (
    "id" TEXT NOT NULL,
    "land_detail_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "media_id" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "land_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_details" (
    "listing_id" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "house_type" "house_type" NOT NULL,
    "build_stage" "build_stage" NOT NULL,
    "handover_date" TIMESTAMP(3),
    "built_area" DECIMAL(10,2) NOT NULL,
    "land_area" DECIMAL(10,2) NOT NULL,
    "floor_plan_id" TEXT,
    "finishing_spec" TEXT NOT NULL,
    "features" TEXT[],

    CONSTRAINT "home_details_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "status_changes" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "from_status" "listing_status",
    "to_status" "listing_status" NOT NULL,
    "changed_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "source" "enquiry_source" NOT NULL,
    "track" "enquiry_track",
    "listing_id" TEXT,
    "page_path" TEXT NOT NULL,
    "campaign" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "preferred_inspection_date" TIMESTAMP(3),
    "status" "enquiry_status" NOT NULL DEFAULT 'new',
    "assigned_to_user_id" TEXT,
    "consent_given_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_enquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organisation" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "capital_band" TEXT NOT NULL,
    "project_interest" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "enquiry_status" NOT NULL DEFAULT 'new',
    "consent_given_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investor_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_notes" (
    "id" TEXT NOT NULL,
    "enquiry_id" TEXT,
    "investor_enquiry_id" TEXT,
    "author_user_id" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "article_category" NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "cover_image_id" TEXT,
    "status" "article_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "avatar_id" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "row_count" INTEGER NOT NULL,
    "success_count" INTEGER NOT NULL,
    "error_count" INTEGER NOT NULL,
    "errors" JSONB,
    "imported_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_sales_track_is_active_idx" ON "users"("role", "sales_track", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "estates_slug_key" ON "estates"("slug");

-- CreateIndex
CREATE INDEX "estate_media_estate_id_position_idx" ON "estate_media"("estate_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "listings_reference_key" ON "listings"("reference");

-- CreateIndex
CREATE INDEX "listings_type_status_idx" ON "listings"("type", "status");

-- CreateIndex
CREATE INDEX "listings_estate_id_idx" ON "listings"("estate_id");

-- CreateIndex
CREATE INDEX "listings_status_featured_idx" ON "listings"("status", "featured");

-- CreateIndex
CREATE INDEX "listing_media_listing_id_position_idx" ON "listing_media"("listing_id", "position");

-- CreateIndex
CREATE INDEX "land_details_title_type_idx" ON "land_details"("title_type");

-- CreateIndex
CREATE INDEX "land_documents_land_detail_id_position_idx" ON "land_documents"("land_detail_id", "position");

-- CreateIndex
CREATE INDEX "home_details_build_stage_idx" ON "home_details"("build_stage");

-- CreateIndex
CREATE INDEX "home_details_bedrooms_idx" ON "home_details"("bedrooms");

-- CreateIndex
CREATE INDEX "status_changes_listing_id_created_at_idx" ON "status_changes"("listing_id", "created_at");

-- CreateIndex
CREATE INDEX "enquiries_status_track_idx" ON "enquiries"("status", "track");

-- CreateIndex
CREATE INDEX "enquiries_assigned_to_user_id_status_idx" ON "enquiries"("assigned_to_user_id", "status");

-- CreateIndex
CREATE INDEX "enquiries_created_at_idx" ON "enquiries"("created_at");

-- CreateIndex
CREATE INDEX "investor_enquiries_status_created_at_idx" ON "investor_enquiries"("status", "created_at");

-- CreateIndex
CREATE INDEX "internal_notes_enquiry_id_created_at_idx" ON "internal_notes"("enquiry_id", "created_at");

-- CreateIndex
CREATE INDEX "internal_notes_investor_enquiry_id_created_at_idx" ON "internal_notes"("investor_enquiry_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_status_published_at_idx" ON "articles"("status", "published_at");

-- CreateIndex
CREATE INDEX "articles_category_idx" ON "articles"("category");

-- CreateIndex
CREATE INDEX "testimonials_published_position_idx" ON "testimonials"("published", "position");

-- CreateIndex
CREATE INDEX "import_batches_created_at_idx" ON "import_batches"("created_at");

-- AddForeignKey
ALTER TABLE "estate_media" ADD CONSTRAINT "estate_media_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estate_media" ADD CONSTRAINT "estate_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land_details" ADD CONSTRAINT "land_details_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land_documents" ADD CONSTRAINT "land_documents_land_detail_id_fkey" FOREIGN KEY ("land_detail_id") REFERENCES "land_details"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land_documents" ADD CONSTRAINT "land_documents_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_details" ADD CONSTRAINT "home_details_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_details" ADD CONSTRAINT "home_details_floor_plan_id_fkey" FOREIGN KEY ("floor_plan_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_changes" ADD CONSTRAINT "status_changes_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_changes" ADD CONSTRAINT "status_changes_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_investor_enquiry_id_fkey" FOREIGN KEY ("investor_enquiry_id") REFERENCES "investor_enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_imported_by_user_id_fkey" FOREIGN KEY ("imported_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
