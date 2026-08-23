/*
  Warnings:

  - You are about to drop the column `label` on the `land_documents` table. All the data in the column will be lost.
  - Added the required column `type` to the `land_documents` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('certificate_of_occupancy', 'governors_consent', 'deed_of_assignment', 'registered_survey_plan', 'excision_certificate', 'gazette_publication', 'estate_layout_approval', 'service_connection', 'purchase_receipt', 'allocation_letter');

-- AlterTable
ALTER TABLE "land_details" ADD COLUMN     "additional_title_types" "title_type"[];

-- AlterTable
ALTER TABLE "land_documents" DROP COLUMN "label",
ADD COLUMN     "note" TEXT,
ADD COLUMN     "type" "document_type" NOT NULL;
