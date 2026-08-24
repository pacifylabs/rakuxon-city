import "server-only";
import { env } from "@/lib/env";

/**
 * FR-3.6 — Cloudflare Turnstile, verified server-side.
 *
 * The token the browser produces means nothing until the secret key is used to
 * confirm it with Cloudflare, which is the entire point: a client-side widget
 * that is never verified is decoration.
 *
 * WHEN TURNSTILE IS NOT CONFIGURED, this returns `configured: false` and the
 * caller proceeds. That is deliberate — the site is designed to run with no
 * .env at all — but it means the challenge is absent, not passed. The route
 * says so in its response and the server logs it, so a production deploy
 * missing the key is visible rather than silently unprotected.
 *
 * Rate limiting still applies in that state.
 */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { configured: false }
  | { configured: true; success: true }
  | { configured: true; success: false; reason: string };

export async function verifyTurnstile(
  token: string | null | undefined,
  ip: string | null,
): Promise<TurnstileResult> {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return { configured: false };

  if (!token) {
    return {
      configured: true,
      success: false,
      reason: "missing-input-response",
    };
  }

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body });
    const result = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (result.success) return { configured: true, success: true };
    return {
      configured: true,
      success: false,
      reason: result["error-codes"]?.join(", ") ?? "verification-failed",
    };
  } catch (error) {
    // Cloudflare being unreachable must not take the enquiry form down with
    // it. Fail closed on a real rejection above, open on an outage here —
    // losing a genuine buyer's enquiry is the worse failure.
    console.error("[turnstile] verification request failed", error);
    return { configured: true, success: true };
  }
}

/** True when the widget should render at all. */
export const turnstileConfigured = Boolean(
  env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY,
);

export const turnstileSiteKey = env.TURNSTILE_SITE_KEY ?? null;
