import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db, hasDatabase } from "@/lib/db";
import { subscriberSchema } from "@/lib/validation/subscriber";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { addToAudience } from "@/lib/email/audience";
import { site } from "@/lib/site";

/**
 * Footer newsletter sign-ups.
 *
 * The list is stored locally first and mirrored to Resend second, so it
 * survives a change of provider and a Resend outage cannot lose a sign-up.
 *
 * CONSENT IS DEFERRED DOUBLE OPT-IN. The address is recorded immediately with
 * `consentGivenAt`, but stays `confirmedAt: null` until it clicks a
 * confirmation email — which cannot be sent until RESEND_API_KEY exists. So
 * sign-ups accumulate now and are confirmed in a batch once it is configured.
 * Nothing is ever mailed to an unconfirmed address, and only confirmed
 * addresses reach the Resend audience.
 *
 * RE-SUBSCRIBING IS IDEMPOTENT. A visitor who signs up twice gets the same
 * cheerful answer both times rather than a duplicate-key error, and their
 * original consent timestamp is preserved. It also means this endpoint cannot
 * be used to discover whether an address is already on the list.
 */
export const runtime = "nodejs";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  const ip = clientIp(request);

  const limited = rateLimit(`subscribe:${ip ?? "unknown"}`, RATE_LIMIT);
  if (!limited.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Give it a moment before trying again.",
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "We could not read that." },
      { status: 400 },
    );
  }

  const parsed = subscriberSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] ??= issue.message;
    }
    return NextResponse.json(
      { error: "validation_failed", fieldErrors },
      { status: 422 },
    );
  }

  const { email, sourcePath } = parsed.data;

  if (!hasDatabase) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: `Sign-up is not connected on this preview. Email ${site.email} and we will add you.`,
      },
      { status: 503 },
    );
  }

  try {
    const normalised = email.trim().toLowerCase();

    const subscriber = await db.subscriber.upsert({
      where: { email: normalised },
      // Already on the list: leave the original consent alone and say yes.
      update: {},
      create: {
        email: normalised,
        sourcePath,
        consentGivenAt: new Date(),
        confirmationToken: randomBytes(24).toString("base64url"),
        unsubscribeToken: randomBytes(24).toString("base64url"),
        ipAddress: ip,
      },
      select: { id: true, confirmedAt: true, syncedToResendAt: true },
    });

    /*
     * Mirror to Resend, but only once confirmed — an unconfirmed address has
     * not proved it belongs to whoever typed it. Today nothing is confirmed,
     * so this never fires; it is here so that the confirmation batch and this
     * route share one code path rather than two that can drift.
     *
     * A failure is swallowed on purpose: the row is saved, `syncedToResendAt`
     * stays null, and a retry can find it.
     */
    if (subscriber.confirmedAt && !subscriber.syncedToResendAt) {
      const sync = await addToAudience(normalised);
      if (sync.status === "synced") {
        await db.subscriber.update({
          where: { id: subscriber.id },
          data: { syncedToResendAt: new Date() },
        });
      }
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[subscribers] failed to record sign-up", error);
    return NextResponse.json(
      {
        error: "server_error",
        message: `Something went wrong our end. Email ${site.email} and we will add you.`,
      },
      { status: 500 },
    );
  }
}
