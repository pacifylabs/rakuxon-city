/**
 * Contact details, social accounts and organisation facts, in one place.
 *
 * Sourced from the sibling `rakuxon-care` project (`lib/cms/data.ts`), which
 * had already done the work of separating what belongs to the Rakuxon group
 * from what belongs to one brand. That distinction decides what could be
 * copied here and what could not:
 *
 *   TAKEN — the group accounts. The care project records these as "verified
 *   group accounts, taken from rakuxon.com... belong to Rakuxon Ltd rather
 *   than to the care brand specifically". They are the group's, so they are
 *   Rakuxon City's too.
 *
 *   NOT TAKEN — anything care-specific. `hello@rakuxoncare.co.uk` is a UK
 *   home-care address; a Lagos buyer enquiring about a plot must not be sent
 *   to it. Nor the CQC status, the Employment Agencies regulations, the
 *   "Across the UK" service area, or `Rakuxon Care Ltd` as a legal name.
 *
 * Nothing here is invented. Where a fact is not established it is absent and
 * recorded in TODO.md, rather than filled with something plausible.
 */

/**
 * The group's Nigerian line, published as WhatsApp on rakuxon.com and carried
 * in the care project's socials as `wa.me/2348167178847`.
 *
 * This replaces `+234 800 000 0000`, which was a placeholder — the 0800 range
 * with all-zero digits is not a dialable Nigerian number, and it was sitting
 * in a `tel:` link on every page.
 */
const PHONE_E164 = "+2348167178847";

export const site = {
  name: "Rakuxon City",

  /**
   * TODO: unverified. Not published on rakuxon.com and not present in the care
   * project, which only carries the care brand's own address. This is the
   * conventional form for the domain and is the address the enquiry mailto
   * links point at, so it must be confirmed before launch — see TODO.md §2.
   */
  email: "hello@rakuxoncity.com",

  phone: {
    e164: PHONE_E164,
    /** Nigerian national format, which is how a local buyer reads a number. */
    display: "0816 717 8847",
    /** Said plainly, as the care project does, rather than implied. */
    note: "Rakuxon group line",
    whatsapp: `https://wa.me/${PHONE_E164.replace("+", "")}`,
  },

  /** Where the company sells. Real: it is where the seeded estates are. */
  regionsServed: ["Lagos", "Ogun", "FCT Abuja"],

  /**
   * Group accounts. TikTok and YouTube are carried across from the care
   * project unchanged; they are the group's channels and are as relevant to
   * this brand as to that one.
   */
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/rakuxon" },
    { label: "Facebook", href: "https://www.facebook.com/rakuxon" },
    { label: "X", href: "https://x.com/rakuxon" },
    { label: "TikTok", href: "https://www.tiktok.com/@rakuxonltd" },
    { label: "YouTube", href: "https://youtube.com/@rakuxon" },
    { label: "WhatsApp", href: `https://wa.me/${PHONE_E164.replace("+", "")}` },
  ],

  /*
   * Deliberately absent — do not fill these with plausible values:
   *
   *   - legalName. "Rakuxon City Ltd" is a guess. The care project names
   *     "Rakuxon Care Ltd" because that is published; nothing equivalent is
   *     published for this brand.
   *   - address. rakuxon.com's London address belongs to the group's UK
   *     businesses. A Nigerian office address has never been published, and
   *     inventing one on a property site would be worse than omitting it.
   *   - RC number / CAC registration. Never published.
   *
   * Each is recorded in TODO.md as a launch gate.
   */
} as const;

/** `tel:` needs E.164; humans need the national form. */
export const telHref = `tel:${site.phone.e164}`;
export const mailtoHref = `mailto:${site.email}`;
