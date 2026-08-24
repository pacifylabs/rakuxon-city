import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

/**
 * Transactional email, via Resend.
 *
 * Configuration is optional, like everything else in this build. With no
 * RESEND_API_KEY the send is skipped and reported as `skipped` — never as
 * sent. The caller decides what that means; for an enquiry it means the row is
 * still persisted and the admin inbox still shows it, so nothing is lost.
 *
 * A failed send never fails the request. An enquiry that reached the database
 * is a captured lead; telling the visitor it failed would make them submit
 * again, and would turn a notification problem into a duplicate-data problem.
 */
export type SendResult =
  | { status: "sent"; id: string | null }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  client ??= new Resend(env.RESEND_API_KEY);
  return client;
}

export const emailConfigured = Boolean(
  env.RESEND_API_KEY && env.ENQUIRY_FROM_EMAIL,
);

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const resend = getClient();
  const from = env.ENQUIRY_FROM_EMAIL;

  if (!resend || !from) {
    const reason = !resend
      ? "RESEND_API_KEY not set"
      : "ENQUIRY_FROM_EMAIL not set";
    console.warn(`[email] skipped "${subject}" — ${reason}`);
    return { status: "skipped", reason };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error(`[email] failed "${subject}"`, error);
      return { status: "failed", reason: error.message };
    }

    return { status: "sent", id: data?.id ?? null };
  } catch (error) {
    console.error(`[email] threw on "${subject}"`, error);
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "unknown",
    };
  }
}
