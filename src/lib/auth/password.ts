import "server-only";
import {
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

/**
 * scrypt, not bcrypt — matching `prisma/seed.ts`, which chose it for exactly
 * this reason: "install nothing for it yet." bcrypt needs a native binding
 * (node-gyp or a prebuilt binary per platform/Node version), which is a real
 * source of "works locally, breaks on deploy" failures for a project that has
 * otherwise gone out of its way to need as little from its environment as
 * possible. `node:crypto`'s scrypt ships with Node itself, works identically
 * everywhere Node runs, and at N=16384 is comparable in cost to bcrypt's
 * factor-12 while being memory-hard, which resists GPU/ASIC cracking better.
 *
 * DEVIATION from docs/PHASE_7_ADMIN_DASHBOARD.md §"Security Considerations"
 * ("Bcrypt password hashing, cost factor 12") and from
 * docs/specs/phase-7-milestone-1-requirements.md FR-M1.1.3. Both were written
 * before this session picked the auth stack; the seed's own comment
 * anticipated this call ("Phase 7 can verify these hashes or re-hash them").
 * Flagged for the client rather than silently reconciled.
 *
 * Format is self-describing: `scrypt$N$r$p$salt$hash`, hex-encoded salt and
 * digest. N/r/p are Node's scrypt defaults (16384/8/1) — recorded in the
 * string for forward compatibility if the defaults ever change, not because
 * they are actually passed to `scryptSync` here.
 */
const KEY_LENGTH = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, KEY_LENGTH).toString("hex");
  return `scrypt$16384$8$1$${salt}$${derived}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  // scrypt / N / r / p / salt / hash — anything else is not a hash this
  // function produced, and must fail closed rather than throw past the caller.
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, , , , salt, hashHex] = parts;
  if (!salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(plain, salt, expected.length);

  // Constant-time comparison — a length or byte-position leak here is a
  // timing side-channel on the password itself.
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

const TEMP_PASSWORD_WORDS = [
  "forest",
  "mountain",
  "river",
  "cloud",
  "sunset",
  "ocean",
  "meadow",
  "valley",
  "canyon",
  "summit",
  "island",
  "harbor",
] as const;

/**
 * A temporary password for a newly-created staff account — memorable enough
 * to read over the phone or type from a printed note, entropy enough
 * (12 words² × 100 numeric suffixes, order-sensitive) that it is not worth
 * guessing before `mustChangePassword` forces a real one on first login.
 */
export function generateTemporaryPassword(): string {
  /*
   * `randomInt`, not `Math.random()`. Math.random is a fast non-cryptographic
   * PRNG: its output is seeded from a small internal state, and V8's xorshift128+
   * is recoverable from a modest run of outputs. That is fine for shuffling a
   * carousel and wrong for a credential — two temporary passwords issued in
   * one session would be enough to start predicting the next. `randomInt`
   * draws from the same CSPRNG as `randomBytes` above, and rejects modulo bias
   * rather than folding it in.
   */
  const selected: string[] = [];
  for (let i = 0; i < 4; i++) {
    selected.push(TEMP_PASSWORD_WORDS[randomInt(TEMP_PASSWORD_WORDS.length)]);
  }

  const numbers = randomInt(100).toString().padStart(2, "0");
  return `${selected.join("-")}-${numbers}`;
}

export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return { valid: errors.length === 0, errors };
}
