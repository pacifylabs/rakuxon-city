import { NextResponse } from "next/server";
import { db, hasDatabase } from "@/lib/db";
import { investorEnquirySchema } from "@/lib/validation/investor-enquiry";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { enquiryReference } from "@/lib/enquiry-reference";
import { sendEmail } from "@/lib/email/send";
import {
  investorAcknowledgement,
  investorNotification,
} from "@/lib/email/templates";
import { env } from "@/lib/env";
import { site } from "@/lib/site";

/**
 * FR-4.3 to FR-4.5 — the partnership endpoint.
 *
 * A SEPARATE ROUTE ON PURPOSE, and the plan is explicit that it must not share
 * a handler with `/api/enquiries`. The reason is not tidiness: an investor
 * submission must never reach the `Enquiry` table, never appear in the sales
 * inbox, and never be round-robin assigned. Every one of those is a rule about
 * where data does NOT go, and the reliable way to keep such a rule is to give
 * it no code path that could break it.
 *
 * So there is no shared helper here that a later refactor could unify. The
 * duplication is the safeguard.
 */
export const runtime = "nodejs";

/** Tighter than the sales form. These arrive in ones, not in bursts. */
const RATE_LIMIT = { limit: 3, windowMs: 15 * 60 * 1000 };

export async function POST(request: Request) {
  const ip = clientIp(request.headers);

  const limited = rateLimit(`investor:${ip ?? "unknown"}`, RATE_LIMIT);
  if (!limited.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "That is a few submissions in a short space of time. Give it a moment, or email us directly.",
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

  const parsed = investorEnquirySchema.safeParse(payload);
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

  if (!hasDatabase) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: `Submissions are not connected on this preview. Please email ${site.email} and we will pick it up.`,
        contactEmail: site.email,
      },
      { status: 503 },
    );
  }

  try {
    const reference = enquiryReference("P");

    // FR-4.4 — its own table. No `track`, no assignment, no sales inbox.
    const enquiry = await db.investorEnquiry.create({
      data: {
        name: input.name,
        organisation: input.organisation ?? null,
        email: input.email,
        phone: input.phone,
        capitalBand: input.capitalBand,
        projectInterest: input.projectInterest,
        message: input.message,
        consentGivenAt: new Date(),
      },
      select: { id: true },
    });

    const notification = investorNotification({
      reference,
      name: input.name,
      organisation: input.organisation ?? null,
      email: input.email,
      phone: input.phone,
      capitalBand: input.capitalBand,
      projectInterest: input.projectInterest,
      message: input.message,
    });

    /*
     * FR-4.4 — a restricted target. If INVESTOR_NOTIFICATION_EMAIL is not set
     * this does NOT fall back to the general inbox: that would put partnership
     * correspondence in front of the sales team, which is the exact thing the
     * separation exists to prevent. It is logged and skipped instead; the row
     * is saved either way and the admin inbox will show it in Phase 7.
     */
    const target = env.INVESTOR_NOTIFICATION_EMAIL;
    const acknowledgement = investorAcknowledgement({
      name: input.name,
      reference,
    });

    await Promise.allSettled([
      target
        ? sendEmail({
            to: target,
            subject: notification.subject,
            html: notification.html,
            text: notification.text,
            replyTo: input.email,
          })
        : Promise.resolve(
            console.warn(
              "[investor-enquiries] INVESTOR_NOTIFICATION_EMAIL is not set — notification skipped rather than sent to the sales inbox.",
            ),
          ),
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
    console.error("[investor-enquiries] failed to record enquiry", error);
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
