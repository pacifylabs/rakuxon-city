/**
 * A short human reference for an enquiry, e.g. `RC-E-7K2M4P`.
 *
 * Shown to the enquirer in their acknowledgement and quoted back over the
 * phone, so it has to survive being read aloud: no `0`/`O`, no `1`/`I`/`L`,
 * and upper case throughout.
 *
 * Not a database key — the cuid is. This exists to be said out loud, and a
 * collision would cost nothing but a moment's confusion on a phone call.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function enquiryReference(prefix: "E" | "P" = "E"): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);

  let out = "";
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];

  return `RC-${prefix}-${out}`;
}
