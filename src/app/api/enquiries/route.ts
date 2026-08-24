import { NextResponse } from "next/server";
import { db, hasDatabase } from "@/lib/db";
import { enquirySchema } from "@/lib/validation/enquiry";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { selectAssignee, trackForListingType } from "@/lib/routing";
import { enquiryReference } from "@/lib/enquiry-reference";
import { sendEmail } from "@/lib/email/send";
import {
  enquiryAcknowledgement,
  enquiryNotification,
} from "@/lib/email/templates";
import { EnquiryStatus, ListingType } from "@/generated/prisma/enums";
import { site } from "@/lib/site";

/**
 * FR-3.1 to FR-3.6 — the enquiry endpoint.
 *
 * Order matters, and it is cheapest-first so an abusive client is rejected
 * before anything expensive happens:
 *
 *   1. rate limit        (in memory, no I/O)
 *   2. shape validation  (no I/O)
 *   3. Turnstile         (one outbound request)
 *   4. persist           (the point of the request)
 *   5. notify            (never allowed to fail the request)
 *
 * The response never echoes back what the visitor typed and never reveals
 * whether an email address is already known to us.
 */
export const runtime = "nodejs";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  const ip = clientIp(request);

  // 1 — rate limit.
  const limited = rateLimit(`enquiry:${ip ?? "unknown"}`, RATE_LIMIT);
  if (!limited.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "That is a few enquiries in a short space of time. Give it a moment, or email us directly.",
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "We could not read that submission." },
      { status: 400 },
    );
  }

  // 2 — shape. Field errors come back keyed so the form can place them.
  const parsed = enquirySchema.safeParse({
    ...(payload as Record<string, unknown>),
    preferredInspectionDate: (payload as { preferredInspectionDate?: string })
      .preferredInspectionDate
      ? new Date(
          (payload as { preferredInspectionDate: string })
            .preferredInspectionDate,
        )
      : null,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return NextResponse.json(
      { error: "validation_failed", fieldErrors },
      { status: 422 },
    );
  }

  const input = parsed.data;

  // 3 — Turnstile. `configured: false` means the challenge is absent, not
  // passed; the site runs without it by design and the server logs the gap.
  const turnstile = await verifyTurnstile(
    (payload as { turnstileToken?: string }).turnstileToken,
    ip,
  );
  if (turnstile.configured && !turnstile.success) {
    return NextResponse.json(
      {
        error: "challenge_failed",
        message:
          "We could not verify that submission. Please reload the page and try again.",
      },
      { status: 403 },
    );
  }
  if (!turnstile.configured) {
    console.warn(
      "[enquiries] Turnstile is not configured — submission accepted without a challenge.",
    );
  }

  // Without a database there is nowhere for this to go, and pretending
  // otherwise is exactly the failure this whole build has been avoiding.
  if (!hasDatabase) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: `Enquiries are not connected on this preview. Please email ${site.email} and we will pick it up.`,
        contactEmail: site.email,
      },
      { status: 503 },
    );
  }

  try {
    // FR-3.3 — the track comes from the listing, never from the request body.
    const listing = input.listingId
      ? await db.listing.findUnique({
          where: { id: input.listingId },
          select: { id: true, type: true, title: true, slug: true },
        })
      : null;

    const track = trackForListingType(listing?.type);

    let assignedTo: { id: string; name: string; email: string } | null = null;
    if (track) {
      const candidates = await db.user.findMany({
        where: { isActive: true, salesTrack: { not: null } },
        select: {
          id: true,
          name: true,
          email: true,
          salesTrack: true,
          isActive: true,
        },
      });

      const grouped = await db.enquiry.groupBy({
        by: ["assignedToUserId"],
        where: {
          assignedToUserId: { not: null },
          status: { in: [EnquiryStatus.NEW, EnquiryStatus.CONTACTED] },
        },
        _count: { _all: true },
      });

      const openCounts = new Map(
        grouped
          .filter((row) => row.assignedToUserId !== null)
          .map((row) => [row.assignedToUserId!, row._count._all]),
      );

      const chosen = selectAssignee(candidates, track, openCounts);
      assignedTo = chosen
        ? {
            id: chosen.id,
            name: candidates.find((c) => c.id === chosen.id)!.name,
            email: candidates.find((c) => c.id === chosen.id)!.email,
          }
        : null;
    }

    const reference = enquiryReference("E");

    const enquiry = await db.enquiry.create({
      data: {
        source: input.source,
        track,
        listingId: listing?.id ?? null,
        pagePath: input.pagePath,
        campaign: input.campaign ?? null,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        preferredInspectionDate: input.preferredInspectionDate ?? null,
        assignedToUserId: assignedTo?.id ?? null,
        // FR-3.5 — timestamped at the moment of submission. NDPR evidence.
        consentGivenAt: new Date(),
        ipAddress: ip,
      },
      select: { id: true },
    });

    // 5 — notify. Deliberately not awaited into the failure path: the lead is
    // captured, and a mail problem must not tell the visitor to submit again.
    const listingPath = listing
      ? `/${listing.type === ListingType.LAND ? "land" : "homes"}/${listing.slug}`
      : null;

    const notification = enquiryNotification({
      reference,
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      track,
      listingTitle: listing?.title ?? null,
      listingPath,
      pagePath: input.pagePath,
      preferredInspectionDate: input.preferredInspectionDate ?? null,
      assignedToName: assignedTo?.name ?? null,
    });

    const acknowledgement = enquiryAcknowledgement({
      name: input.name,
      reference,
      listingTitle: listing?.title ?? null,
    });

    await Promise.allSettled([
      sendEmail({
        to: assignedTo?.email ?? site.email,
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
        // So a reply from the sales desk reaches the buyer directly.
        replyTo: input.email,
      }),
      sendEmail({
        to: input.email,
        subject: acknowledgement.subject,
        html: acknowledgement.html,
        text: acknowledgement.text,
      }),
    ]);

    return NextResponse.json(
      { ok: true, reference, id: enquiry.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("[enquiries] failed to record enquiry", error);
    return NextResponse.json(
      {
        error: "server_error",
        message: `Something went wrong our end. Please email ${site.email} so we do not lose this.`,
        contactEmail: site.email,
      },
      { status: 500 },
    );
  }
}
