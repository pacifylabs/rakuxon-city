import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

/**
 * Pushing a confirmed subscriber into the Resend audience.
 *
 * The local `Subscriber` table is authoritative; this is a mirror. That order
 * is deliberate and is what the client chose: the list survives a change of
 * email provider, and a Resend outage cannot lose a sign-up.
 *
 * NOTHING HERE IS ALLOWED TO FAIL A REQUEST. A sync failure leaves
 * `syncedToResendAt` null, which is exactly the marker a retry needs to find
 * the row again. Telling a visitor their sign-up failed, when it is sitting
 * safely in the database, would make them submit again.
 *
 * Only CONFIRMED addresses are pushed. An unconfirmed address has not proved
 * it belongs to the person who typed it, and putting it in a sending audience
 * is how a list ends up mailing people who never asked.
 */
let client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  client ??= new Resend(env.RESEND_API_KEY);
  return client;
}

export const audienceConfigured = Boolean(
  env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID,
);

export type SyncResult =
  | { status: "synced" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

export async function addToAudience(email: string): Promise<SyncResult> {
  const resend = getClient();
  const audienceId = env.RESEND_AUDIENCE_ID;

  if (!resend || !audienceId) {
    const reason = !resend
      ? "RESEND_API_KEY not set"
      : "RESEND_AUDIENCE_ID not set";
    return { status: "skipped", reason };
  }

  try {
    const { error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (error) {
      console.error(`[audience] failed to add ${email}`, error);
      return { status: "failed", reason: error.message };
    }

    return { status: "synced" };
  } catch (error) {
    console.error(`[audience] threw adding ${email}`, error);
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "unknown",
    };
  }
}
