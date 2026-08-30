"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/auth/dal";
import { canAccessTrack } from "@/lib/admin/access";
import { changeListingStatus } from "@/lib/admin/queries/listings";
import {
  landListingSchema,
  homeListingSchema,
} from "@/lib/validation/listing";
import {
  ListingStatus,
  ListingType,
  PlotUnit,
  TitleType,
  DocumentType,
  HouseType,
  BuildStage,
} from "@/generated/prisma/enums";

export type ActionState = { error?: string; success?: string } | null;

/** `""` from an unfilled optional field means "not set", not "empty string". */
function optionalText(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : text;
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (text === "") return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

/** One `<select multiple>` or repeated checkbox name → a typed enum array. */
function enumArray<T extends string>(
  values: FormDataEntryValue[],
  allowed: Record<string, T>,
): T[] {
  const valid = new Set(Object.values(allowed));
  return values
    .map((value) => String(value))
    .filter((value): value is T => valid.has(value as T));
}

/**
 * Land documents arrive as three parallel arrays — `docType[]`, `docNote[]`,
 * `docMediaId[]` — because an HTML form has no nested structure. Rows where
 * the type is blank are dropped, which is how the form's "add another"
 * placeholder rows disappear on save without needing client-side bookkeeping.
 */
function parseDocuments(formData: FormData) {
  const types = formData.getAll("docType");
  const notes = formData.getAll("docNote");
  const mediaIds = formData.getAll("docMediaId");

  const allowed = new Set(Object.values(DocumentType));

  return types
    .map((type, index) => ({
      type: String(type),
      note: optionalText(notes[index] ?? null),
      mediaId: optionalText(mediaIds[index] ?? null),
    }))
    .filter((doc): doc is { type: DocumentType; note: string | null; mediaId: string | null } =>
      allowed.has(doc.type as DocumentType),
    );
}

function parsePaymentPlan(formData: FormData) {
  if (formData.get("paymentPlanAvailable") !== "on") return null;

  const depositPercent = optionalNumber(formData.get("depositPercent"));
  const durationMonths = optionalNumber(formData.get("durationMonths"));
  const frequency = String(formData.get("frequency") ?? "monthly");

  if (depositPercent === null || durationMonths === null) return null;

  return {
    depositPercent,
    durationMonths,
    frequency: (["monthly", "quarterly", "biannual"] as const).includes(
      frequency as "monthly",
    )
      ? (frequency as "monthly" | "quarterly" | "biannual")
      : "monthly",
    notes: optionalText(formData.get("planNotes")) ?? undefined,
  };
}

function baseFieldsFrom(formData: FormData, type: ListingType) {
  const priceOnRequest = formData.get("priceOnRequest") === "on";
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    reference: String(formData.get("reference") ?? "").trim(),
    type,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    estateId: optionalText(formData.get("estateId")),
    location: String(formData.get("location") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    // FR-1.5: a figure or the flag, never both. The schema enforces it; this
    // just makes sure a stale number in a hidden field can't sneak through.
    price: priceOnRequest ? null : optionalNumber(formData.get("price")),
    priceOnRequest,
    status: String(formData.get("status") ?? ListingStatus.DRAFT) as ListingStatus,
    paymentPlanAvailable: formData.get("paymentPlanAvailable") === "on",
    paymentPlanTerms: parsePaymentPlan(formData),
    featured: formData.get("featured") === "on",
  };
}

/** First Zod issue, phrased for a person rather than dumped as JSON. */
function firstIssue(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const issue = error.issues[0];
  if (!issue) return "Something in the form is not valid.";
  const field = issue.path.filter(Boolean).join(" → ");
  return field ? `${field}: ${issue.message}` : issue.message;
}

export async function saveLandListing(
  listingId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await verifySession();
  if (!canAccessTrack(user, ListingType.LAND)) {
    return { error: "You do not have access to land listings." };
  }

  const parsed = landListingSchema.safeParse({
    ...baseFieldsFrom(formData, ListingType.LAND),
    type: ListingType.LAND,
    landDetail: {
      plotSize: optionalNumber(formData.get("plotSize")) ?? 0,
      plotUnit: String(formData.get("plotUnit") ?? PlotUnit.SQM) as PlotUnit,
      titleType: String(formData.get("titleType") ?? "") as TitleType,
      additionalTitleTypes: enumArray(
        formData.getAll("additionalTitleTypes"),
        TitleType,
      ),
      surveyNumber: optionalText(formData.get("surveyNumber")),
      topography: optionalText(formData.get("topography")),
      roadAccess: optionalText(formData.get("roadAccess")),
      documents: parseDocuments(formData),
    },
  });

  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const input = parsed.data;

  try {
    if (listingId) {
      await db.$transaction(async (tx) => {
        await tx.listing.update({
          where: { id: listingId },
          data: {
            slug: input.slug,
            reference: input.reference,
            title: input.title,
            description: input.description,
            estateId: input.estateId ?? null,
            location: input.location,
            state: input.state,
            price: input.price,
            priceOnRequest: input.priceOnRequest,
            paymentPlanAvailable: input.paymentPlanAvailable,
            paymentPlanTerms: input.paymentPlanTerms ?? undefined,
            featured: input.featured,
          },
        });
        await tx.landDetail.update({
          where: { listingId },
          data: {
            plotSize: input.landDetail.plotSize,
            plotUnit: input.landDetail.plotUnit,
            titleType: input.landDetail.titleType,
            additionalTitleTypes: input.landDetail.additionalTitleTypes,
            surveyNumber: input.landDetail.surveyNumber ?? null,
            topography: input.landDetail.topography ?? null,
            roadAccess: input.landDetail.roadAccess ?? null,
          },
        });
        // Documents are replaced wholesale rather than diffed: they have no
        // stable identity in the form (no id round-trips), and the set is
        // small enough that a delete-and-recreate inside the transaction is
        // simpler to reason about than a merge.
        await tx.landDocument.deleteMany({ where: { landDetailId: listingId } });
        if (input.landDetail.documents.length > 0) {
          await tx.landDocument.createMany({
            data: input.landDetail.documents.map((doc, index) => ({
              landDetailId: listingId,
              type: doc.type,
              note: doc.note ?? null,
              mediaId: doc.mediaId ?? null,
              position: index,
            })),
          });
        }
      });
    } else {
      await db.listing.create({
        data: {
          slug: input.slug,
          reference: input.reference,
          type: ListingType.LAND,
          title: input.title,
          description: input.description,
          estateId: input.estateId ?? null,
          location: input.location,
          state: input.state,
          price: input.price,
          priceOnRequest: input.priceOnRequest,
          // New listings always start as drafts, whatever the form said —
          // publishing is a deliberate second step through the status control,
          // which is also the only path that writes a StatusChange row.
          status: ListingStatus.DRAFT,
          paymentPlanAvailable: input.paymentPlanAvailable,
          paymentPlanTerms: input.paymentPlanTerms ?? undefined,
          featured: input.featured,
          landDetail: {
            create: {
              plotSize: input.landDetail.plotSize,
              plotUnit: input.landDetail.plotUnit,
              titleType: input.landDetail.titleType,
              additionalTitleTypes: input.landDetail.additionalTitleTypes,
              surveyNumber: input.landDetail.surveyNumber ?? null,
              topography: input.landDetail.topography ?? null,
              roadAccess: input.landDetail.roadAccess ?? null,
              documents: {
                create: input.landDetail.documents.map((doc, index) => ({
                  type: doc.type,
                  note: doc.note ?? null,
                  mediaId: doc.mediaId ?? null,
                  position: index,
                })),
              },
            },
          },
        },
      });
    }
  } catch (error) {
    return { error: describeWriteError(error) };
  }

  revalidatePath("/admin/listings/land");
  revalidatePath("/land");
  redirect("/admin/listings/land?saved=1");
}

export async function saveHomeListing(
  listingId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await verifySession();
  if (!canAccessTrack(user, ListingType.HOME)) {
    return { error: "You do not have access to home listings." };
  }

  const handoverRaw = optionalText(formData.get("handoverDate"));

  const parsed = homeListingSchema.safeParse({
    ...baseFieldsFrom(formData, ListingType.HOME),
    type: ListingType.HOME,
    homeDetail: {
      bedrooms: optionalNumber(formData.get("bedrooms")) ?? 0,
      bathrooms: optionalNumber(formData.get("bathrooms")) ?? 0,
      houseType: String(formData.get("houseType") ?? "") as HouseType,
      buildStage: String(formData.get("buildStage") ?? "") as BuildStage,
      handoverDate: handoverRaw ? new Date(handoverRaw) : null,
      builtArea: optionalNumber(formData.get("builtArea")) ?? 0,
      landArea: optionalNumber(formData.get("landArea")) ?? 0,
      floorPlanId: optionalText(formData.get("floorPlanId")),
      finishingSpec: String(formData.get("finishingSpec") ?? "").trim(),
      features: formData
        .getAll("features")
        .map((value) => String(value).trim())
        .filter(Boolean),
    },
  });

  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const input = parsed.data;

  try {
    if (listingId) {
      await db.$transaction([
        db.listing.update({
          where: { id: listingId },
          data: {
            slug: input.slug,
            reference: input.reference,
            title: input.title,
            description: input.description,
            estateId: input.estateId ?? null,
            location: input.location,
            state: input.state,
            price: input.price,
            priceOnRequest: input.priceOnRequest,
            paymentPlanAvailable: input.paymentPlanAvailable,
            paymentPlanTerms: input.paymentPlanTerms ?? undefined,
            featured: input.featured,
          },
        }),
        db.homeDetail.update({
          where: { listingId },
          data: {
            bedrooms: input.homeDetail.bedrooms,
            bathrooms: input.homeDetail.bathrooms,
            houseType: input.homeDetail.houseType,
            buildStage: input.homeDetail.buildStage,
            handoverDate: input.homeDetail.handoverDate ?? null,
            builtArea: input.homeDetail.builtArea,
            landArea: input.homeDetail.landArea,
            floorPlanId: input.homeDetail.floorPlanId ?? null,
            finishingSpec: input.homeDetail.finishingSpec,
            features: input.homeDetail.features,
          },
        }),
      ]);
    } else {
      await db.listing.create({
        data: {
          slug: input.slug,
          reference: input.reference,
          type: ListingType.HOME,
          title: input.title,
          description: input.description,
          estateId: input.estateId ?? null,
          location: input.location,
          state: input.state,
          price: input.price,
          priceOnRequest: input.priceOnRequest,
          status: ListingStatus.DRAFT,
          paymentPlanAvailable: input.paymentPlanAvailable,
          paymentPlanTerms: input.paymentPlanTerms ?? undefined,
          featured: input.featured,
          homeDetail: {
            create: {
              bedrooms: input.homeDetail.bedrooms,
              bathrooms: input.homeDetail.bathrooms,
              houseType: input.homeDetail.houseType,
              buildStage: input.homeDetail.buildStage,
              handoverDate: input.homeDetail.handoverDate ?? null,
              builtArea: input.homeDetail.builtArea,
              landArea: input.homeDetail.landArea,
              floorPlanId: input.homeDetail.floorPlanId ?? null,
              finishingSpec: input.homeDetail.finishingSpec,
              features: input.homeDetail.features,
            },
          },
        },
      });
    }
  } catch (error) {
    return { error: describeWriteError(error) };
  }

  revalidatePath("/admin/listings/homes");
  revalidatePath("/homes");
  redirect("/admin/listings/homes?saved=1");
}

export async function updateListingStatus(formData: FormData): Promise<void> {
  const user = await verifySession();
  const listingId = String(formData.get("listingId") ?? "");
  const status = String(formData.get("status") ?? "") as ListingStatus;
  const track = String(formData.get("track") ?? "land");

  if (!Object.values(ListingStatus).includes(status)) return;

  await changeListingStatus(user, listingId, status);

  revalidatePath(`/admin/listings/${track}`);
  revalidatePath(track === "land" ? "/land" : "/homes");
}

/**
 * Prisma's unique-constraint failure is the one write error a person can
 * actually fix from the form, so it gets named. Everything else is logged
 * shape-only and reported generically — an admin does not need the raw
 * driver message, and it can carry connection details.
 */
function describeWriteError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : null;

  if (code === "P2002") {
    return "That slug or reference is already used by another listing.";
  }
  console.error("[admin] listing write failed", code ?? error);
  return "Could not save the listing. Please try again.";
}
