import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";

/** Same contract as the main Rakuxon backend — host + a From address. */
export function smtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && mailFromAddress());
}

function parseSecure(value: string | undefined): boolean {
  if (value === undefined || value === "") return false;
  return value === "true" || value === "1";
}

/** Display From header — SMTP_FROM wins, then ENQUIRY_FROM_EMAIL. */
export function mailFromAddress(): string | undefined {
  return env.SMTP_FROM ?? env.ENQUIRY_FROM_EMAIL;
}

let transport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (!smtpConfigured()) return null;
  transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: parseSecure(env.SMTP_SECURE),
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
  });
  return transport;
}

export async function sendViaSmtp({
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
}): Promise<{ ok: true; messageId: string | undefined } | { ok: false; reason: string }> {
  const transporter = getTransport();
  const from = mailFromAddress();

  if (!transporter || !from) {
    return { ok: false, reason: "SMTP not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "unknown",
    };
  }
}
