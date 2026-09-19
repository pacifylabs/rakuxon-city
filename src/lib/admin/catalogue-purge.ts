import "server-only";
import { db } from "@/lib/db";

/**
 * Removes catalogue / marketing content seeded for demos — keeps every user row
 * (admins, sales, listers). Same delete order as `prisma/seed.ts` `clear()`.
 */
export async function purgeCatalogueContent(): Promise<void> {
  await db.portalNotification.deleteMany();
  await db.mediaPlacement.deleteMany();
  await db.internalNote.deleteMany();
  await db.enquiry.deleteMany();
  await db.investorEnquiry.deleteMany();
  await db.video.deleteMany();
  await db.statusChange.deleteMany();
  await db.landDocument.deleteMany();
  await db.landDetail.deleteMany();
  await db.homeDetail.deleteMany();
  await db.listingMedia.deleteMany();
  await db.estateMedia.deleteMany();
  await db.listing.deleteMany();
  await db.estate.deleteMany();
  await db.article.deleteMany();
  await db.testimonial.deleteMany();
  await db.importBatch.deleteMany();
  await db.media.deleteMany();
  await db.metricsCache.deleteMany();
}
