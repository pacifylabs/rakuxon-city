import "server-only";

/**
 * FR-3.6 — per-IP rate limiting on the enquiry routes.
 *
 * A fixed window held in process memory. That has a real limitation worth
 * stating rather than discovering: it is per-instance. On a platform that runs
 * several serverless instances, an attacker gets the limit multiplied by the
 * number of instances they happen to hit.
 *
 * It is still worth having. It stops the ordinary case — a script hammering
 * one endpoint, or a frustrated visitor pressing send eleven times — and it
 * adds no infrastructure. Turnstile is what stands between the site and a
 * determined attacker; this is what stops the noise.
 *
 * Phase 7 introduces Redis for job queues. Moving this to a shared store then
 * is a small change, and is recorded in TODO.md.
 */
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Bounded so a spray of unique IPs cannot grow the map without limit. */
const MAX_TRACKED = 10_000;

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets. For the Retry-After header. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED) {
      // Drop whatever has already expired before admitting a new key.
      for (const [entryKey, entry] of windows) {
        if (entry.resetAt <= now) windows.delete(entryKey);
      }
      // Still full: the oldest insertion goes. Map preserves insertion order.
      if (windows.size >= MAX_TRACKED) {
        const oldest = windows.keys().next().value;
        if (oldest !== undefined) windows.delete(oldest);
      }
    }
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfter: 0 };
}

/**
 * The client IP, from whichever proxy header the platform sets.
 *
 * These headers are spoofable by anyone talking to the origin directly, so a
 * value here is a hint rather than an identity. It is used to rate limit and is
 * stored on the enquiry for abuse investigation; nothing is authorised by it.
 */
export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  // Left-most entry is the original client; the rest are proxies.
  if (forwarded) return forwarded.split(",")[0]!.trim() || null;
  return request.headers.get("x-real-ip");
}

/** Exposed for tests; there is no other reason to clear this. */
export function __resetRateLimits() {
  windows.clear();
}
