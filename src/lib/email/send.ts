import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { mailFromAddress, sendViaSmtp, smtpConfigured } from "@/lib/email/smtp";

/**
 * Transactional email — SMTP when configured (same as the main Rakuxon stack),
 * otherwise Resend if a key is present.
 *
 * With neither provider configured the send is skipped and reported as
 * `skipped` — never as sent. The caller decides what that means; for an
 * enquiry it means the row is still persisted and the admin inbox still shows
 * it, so nothing is lost.
 *
 * A failed send never fails the request. An enquiry that reached the database
 * is a captured lead; telling the visitor it failed would make them submit
 * again, and would turn a notification problem into a duplicate-data problem.
 */
export type SendResult =
  | { status: "sent"; id: string | null }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  resendClient ??= new Resend(env.RESEND_API_KEY);
  return resendClient;
}

export const emailConfigured = smtpConfigured() || Boolean(
  env.RESEND_API_KEY && mailFromAddress(),
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
  if (smtpConfigured()) {
    const result = await sendViaSmtp({ to, subject, html, text, replyTo });
    if (result.ok) {
      return { status: "sent", id: result.messageId ?? null };
    }
    console.error(`[email] SMTP failed "${subject}"`, result.reason);
    return { status: "failed", reason: result.reason };
  }

  const resend = getResendClient();
  const from = mailFromAddress();

  if (!resend || !from) {
    const reason = !resend
      ? "No SMTP or RESEND_API_KEY configured"
      : "SMTP_FROM / ENQUIRY_FROM_EMAIL not set";
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
      console.error(`[email] Resend failed "${subject}"`, error);
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
