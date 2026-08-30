import { z } from "zod";
import {
  BuildStage,
  DocumentType,
  HouseType,
  ListingStatus,
  ListingType,
  PlotUnit,
  TitleType,
} from "@/generated/prisma/enums";

/** RXC-LND-0142 / RXC-HME-0031 — quoted on the phone, and the CSV idempotency key. */
export const listingReferenceSchema = z
  .string()
  .regex(
    /^RXC-(LND|HME)-\d{4}$/,
    "Reference must look like RXC-LND-0142 or RXC-HME-0031",
  );

export const slugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase words separated by hyphens",
  );

/** Structured rather than prose, so Phase 2's schedule generator reads it directly. */
export const paymentPlanTermsSchema = z.object({
  depositPercent: z.number().int().min(0).max(100),
  durationMonths: z.number().int().min(1).max(120),
  frequency: z.enum(["monthly", "quarterly", "biannual"]),
  notes: z.string().max(500).optional(),
});

export type PaymentPlanTerms = z.infer<typeof paymentPlanTermsSchema>;

const listingBaseSchema = z.object({
  slug: slugSchema,
  reference: listingReferenceSchema,
  type: z.enum(ListingType),
  title: z.string().min(3).max(160),
  description: z.string().min(20),
  estateId: z.string().nullable().optional(),
  location: z.string().min(2).max(120),
  state: z.string().min(2).max(60),
  /** Naira, never negative, never zero. Null is only valid alongside priceOnRequest. */
  price: z.number().positive().max(999_999_999_999).nullable(),
  priceOnRequest: z.boolean(),
  status: z.enum(ListingStatus),
  paymentPlanAvailable: z.boolean(),
  paymentPlanTerms: paymentPlanTermsSchema.nullable().optional(),
  featured: z.boolean().default(false),
});

/**
 * FR-1.5 is an invariant, not a display rule: a listing carries either a figure
 * or an explicit on-request flag, never both and never neither. Encoded once,
 * here, so no form or importer can persist the blank-price state that design
 * system §11 forbids on a card.
 */
function checkListingInvariants(
  value: {
    price: number | null;
    priceOnRequest: boolean;
    paymentPlanAvailable: boolean;
    paymentPlanTerms?: PaymentPlanTerms | null;
  },
  ctx: z.RefinementCtx,
): void {
  if (value.priceOnRequest && value.price !== null) {
    ctx.addIssue({
      code: "custom",
      path: ["price"],
      message: "Price-on-request listings must not carry a figure",
    });
  }

  if (!value.priceOnRequest && value.price === null) {
    ctx.addIssue({
      code: "custom",
      path: ["price"],
      message: "Enter a price, or mark the listing as price on request",
    });
  }

  if (value.paymentPlanAvailable && !value.paymentPlanTerms) {
    ctx.addIssue({
      code: "custom",
      path: ["paymentPlanTerms"],
      message: "Set the payment plan terms, or turn the payment plan off",
    });
  }
}

export const landDetailSchema = z.object({
  plotSize: z.number().positive(),
  plotUnit: z.enum(PlotUnit),
  /** The strongest title held, and the one the card badge leads with. */
  titleType: z.enum(TitleType),
  /** Anything else held alongside the lead. Rendered in the ribbon, never on a card. */
  additionalTitleTypes: z.array(z.enum(TitleType)).default([]),
  surveyNumber: z.string().max(60).nullable().optional(),
  topography: z.string().max(200).nullable().optional(),
  roadAccess: z.string().max(200).nullable().optional(),
  /*
   * Corrected in Phase 7 to match the model.
   *
   * These were `{ label, mediaId }` free text when Phase 1 wrote this schema.
   * The `20260823071305_typed_land_documents` migration replaced that with a
   * `DocumentType` enum plus an optional `note`, and added
   * `additionalTitleTypes` to LandDetail — but this schema was never brought
   * along, so it had been describing a shape the database stopped accepting
   * three migrations ago. Nothing caught it because nothing wrote a listing
   * through it until now: the seed builds rows with the Prisma client
   * directly, and the public site only reads.
   */
  documents: z
    .array(
      z.object({
        type: z.enum(DocumentType),
        note: z.string().max(200).nullable().optional(),
        mediaId: z.string().nullable().optional(),
      }),
    )
    .default([]),
});

export const homeDetailSchema = z.object({
  bedrooms: z.number().int().min(1).max(20),
  bathrooms: z.number().int().min(1).max(20),
  houseType: z.enum(HouseType),
  buildStage: z.enum(BuildStage),
  handoverDate: z.date().nullable().optional(),
  builtArea: z.number().positive(),
  landArea: z.number().positive(),
  floorPlanId: z.string().nullable().optional(),
  finishingSpec: z.string().min(10),
  features: z.array(z.string().min(2).max(80)).default([]),
});

export const landListingSchema = listingBaseSchema
  .extend({
    type: z.literal(ListingType.LAND),
    landDetail: landDetailSchema,
  })
  .superRefine(checkListingInvariants);

export const homeListingSchema = listingBaseSchema
  .extend({
    type: z.literal(ListingType.HOME),
    homeDetail: homeDetailSchema,
  })
  .superRefine(checkListingInvariants);

export const listingSchema = z.discriminatedUnion("type", [
  landListingSchema,
  homeListingSchema,
]);

export type LandListingInput = z.infer<typeof landListingSchema>;
export type HomeListingInput = z.infer<typeof homeListingSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
