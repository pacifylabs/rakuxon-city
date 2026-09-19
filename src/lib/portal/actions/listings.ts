"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  landListingSchema,
  homeListingSchema,
} from "@/lib/validation/listing";
import {
  BuildStage,
  DocumentType,
  HouseType,
  ListingModerationStatus,
  ListingStatus,
  ListingType,
  PlotUnit,
  TitleType,
} from "@/generated/prisma/enums";
import { origin } from "@/lib/seo";
import { site } from "@/lib/site";
import { sendEmail } from "@/lib/email/send";
import { listingSubmittedForReviewEmail } from "@/lib/email/templates";
import { verifyPortalSession } from "@/lib/portal/access";
import {
  generateListerReference,
  uniqueListerSlug,
} from "@/lib/portal/reference";
import type { ActionState } from "@/lib/admin/actions/listings";

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

function enumArray<T extends string>(
  values: FormDataEntryValue[],
  allowed: Record<string, T>,
): T[] {
  const valid = new Set(Object.values(allowed));
  return values
    .map((value) => String(value))
    .filter((value): value is T => valid.has(value as T));
}

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
    .filter(
      (
        doc,
      ): doc is {
        type: DocumentType;
        note: string | null;
        mediaId: string | null;
      } => allowed.has(doc.type as DocumentType),
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

function portalBaseFields(formData: FormData, type: ListingType) {
  const priceOnRequest = formData.get("priceOnRequest") === "on";
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    reference: String(formData.get("reference") ?? "").trim(),
    type,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    estateId: null as string | null,
    location: String(formData.get("location") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    price: priceOnRequest ? null : optionalNumber(formData.get("price")),
    priceOnRequest,
    status: ListingStatus.DRAFT,
    paymentPlanAvailable: formData.get("paymentPlanAvailable") === "on",
    paymentPlanTerms: parsePaymentPlan(formData),
    featured: false,
  };
}

function firstIssue(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  const issue = error.issues[0];
  if (!issue) return "Something in the form is not valid.";
  const field = issue.path.filter(Boolean).join(" → ");
  return field ? `${field}: ${issue.message}` : issue.message;
}

async function assertEditableByLister(
  userId: string,
  listingId: string,
): Promise<string | null> {
  const listing = await db.listing.findFirst({
    where: { id: listingId, submittedByUserId: userId },
    select: { moderationStatus: true },
  });
  if (!listing) return "Listing not found.";
  if (listing.moderationStatus === ListingModerationStatus.PENDING_REVIEW) {
    return "This listing is awaiting review and cannot be edited.";
  }
  return null;
}

export async function savePortalLandListing(
  listingId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await verifyPortalSession();

  if (listingId) {
    const blocked = await assertEditableByLister(user.id, listingId);
    if (blocked) return { error: blocked };
  }

  let slug = String(formData.get("slug") ?? "").trim();
  let reference = String(formData.get("reference") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!listingId) {
    reference = generateListerReference(ListingType.LAND);
    slug = await uniqueListerSlug(db, title);
  }

  const parsed = landListingSchema.safeParse({
    ...portalBaseFields(formData, ListingType.LAND),
    slug,
    reference,
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
            title: input.title,
            description: input.description,
            location: input.location,
            state: input.state,
            price: input.price,
            priceOnRequest: input.priceOnRequest,
            paymentPlanAvailable: input.paymentPlanAvailable,
            paymentPlanTerms: input.paymentPlanTerms ?? undefined,
            moderationStatus: ListingModerationStatus.DRAFT,
            rejectionReason: null,
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
      const created = await db.listing.create({
        data: {
          slug: input.slug,
          reference: input.reference,
          type: ListingType.LAND,
          title: input.title,
          description: input.description,
          location: input.location,
          state: input.state,
          price: input.price,
          priceOnRequest: input.priceOnRequest,
          status: ListingStatus.DRAFT,
          paymentPlanAvailable: input.paymentPlanAvailable,
          paymentPlanTerms: input.paymentPlanTerms ?? undefined,
          featured: false,
          submittedByUserId: user.id,
          moderationStatus: ListingModerationStatus.DRAFT,
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
        select: { id: true },
      });
      revalidatePath("/portal/listings");
      redirect(`/portal/listings/land/${created.id}/edit?saved=1`);
    }
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : null;
    if (code === "P2002") {
      return { error: "Could not save — try a different title." };
    }
    console.error("[portal] land listing write failed", code ?? error);
    return { error: "Could not save the listing. Please try again." };
  }

  revalidatePath("/portal/listings");
  redirect(`/portal/listings/land/${listingId}/edit?saved=1`);
}

export async function savePortalHomeListing(
  listingId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await verifyPortalSession();

  if (listingId) {
    const blocked = await assertEditableByLister(user.id, listingId);
    if (blocked) return { error: blocked };
  }

  let slug = String(formData.get("slug") ?? "").trim();
  let reference = String(formData.get("reference") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!listingId) {
    reference = generateListerReference(ListingType.HOME);
    slug = await uniqueListerSlug(db, title);
  }

  const handoverRaw = optionalText(formData.get("handoverDate"));

  const parsed = homeListingSchema.safeParse({
    ...portalBaseFields(formData, ListingType.HOME),
    slug,
    reference,
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
            title: input.title,
            description: input.description,
            location: input.location,
            state: input.state,
            price: input.price,
            priceOnRequest: input.priceOnRequest,
            paymentPlanAvailable: input.paymentPlanAvailable,
            paymentPlanTerms: input.paymentPlanTerms ?? undefined,
            moderationStatus: ListingModerationStatus.DRAFT,
            rejectionReason: null,
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
      const created = await db.listing.create({
        data: {
          slug: input.slug,
          reference: input.reference,
          type: ListingType.HOME,
          title: input.title,
          description: input.description,
          location: input.location,
          state: input.state,
          price: input.price,
          priceOnRequest: input.priceOnRequest,
          status: ListingStatus.DRAFT,
          paymentPlanAvailable: input.paymentPlanAvailable,
          paymentPlanTerms: input.paymentPlanTerms ?? undefined,
          featured: false,
          submittedByUserId: user.id,
          moderationStatus: ListingModerationStatus.DRAFT,
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
        select: { id: true },
      });
      revalidatePath("/portal/listings");
      redirect(`/portal/listings/homes/${created.id}/edit?saved=1`);
    }
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : null;
    if (code === "P2002") {
      return { error: "Could not save — try a different title." };
    }
    console.error("[portal] home listing write failed", code ?? error);
    return { error: "Could not save the listing. Please try again." };
  }

  revalidatePath("/portal/listings");
  redirect(`/portal/listings/homes/${listingId}/edit?saved=1`);
}

export async function submitListingForReview(formData: FormData): Promise<void> {
  const user = await verifyPortalSession();
  const listingId = String(formData.get("listingId") ?? "");

  const listing = await db.listing.findFirst({
    where: { id: listingId, submittedByUserId: user.id },
    select: { moderationStatus: true, title: true },
  });

  if (!listing) return;

  if (
    listing.moderationStatus !== ListingModerationStatus.DRAFT &&
    listing.moderationStatus !== ListingModerationStatus.REJECTED
  ) {
    return;
  }

  await db.listing.update({
    where: { id: listingId },
    data: {
      moderationStatus: ListingModerationStatus.PENDING_REVIEW,
      submittedAt: new Date(),
      rejectionReason: null,
    },
  });

  const moderation = listingSubmittedForReviewEmail({
    listingTitle: listing.title,
    listerName: user.name,
    listerEmail: user.email,
    moderationUrl: `${origin()}/admin/moderation`,
  });
  void sendEmail({
    to: site.email,
    subject: moderation.subject,
    html: moderation.html,
    text: moderation.text,
  });

  revalidatePath("/portal/listings");
  revalidatePath("/admin/moderation");
  redirect("/portal/listings?submitted=1");
}
