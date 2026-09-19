/**
 * Blocks common disposable / throwaway inbox domains at registration.
 * Not exhaustive — pairs with requiring verified email before portal access.
 */
const DISPOSABLE_DOMAINS = new Set(
  [
    "mailinator.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "sharklasers.com",
    "grr.la",
    "10minutemail.com",
    "10minutemail.net",
    "tempmail.com",
    "temp-mail.org",
    "throwaway.email",
    "yopmail.com",
    "trashmail.com",
    "getnada.com",
    "maildrop.cc",
    "dispostable.com",
    "fakeinbox.com",
    "mintemail.com",
    "mytemp.email",
    "emailondeck.com",
    "spamgourmet.com",
    "mailnesia.com",
    "moakt.com",
    "tmpmail.net",
    "tmpmail.org",
    "discard.email",
    "mailcatch.com",
    "inboxkitten.com",
    "mailpoof.com",
    "luxusmail.org",
    "crazymailing.com",
    "tempr.email",
    "dropmail.me",
    "harakirimail.com",
    "mailinator.net",
    "mailinator.org",
    "mailinator2.com",
    "sogetthis.com",
    "spam4.me",
    "trbvm.com",
    "byom.de",
    "trashmail.me",
    "trashmail.net",
    "mailnull.com",
    "spambox.us",
    "getairmail.com",
    "mailscrap.com",
    "mailsac.com",
    "mailtemp.net",
    "tempail.com",
    "tempinbox.com",
    "burnermail.io",
    "inboxbear.com",
    "fakemail.net",
    "emailfake.com",
    "cuvox.de",
    "dayrep.com",
    "einrot.com",
    "superrito.com",
    "teleworm.us",
    "armyspy.com",
    "rhyta.com",
    "jourrapide.com",
    "gustr.com",
  ].map((d) => d.toLowerCase()),
);

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 1) return true;
  const domain = email.slice(at + 1).trim().toLowerCase();
  if (!domain.includes(".")) return true;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  const parts = domain.split(".");
  const base = parts.length >= 2 ? `${parts.at(-2)}.${parts.at(-1)}` : domain;
  return DISPOSABLE_DOMAINS.has(base);
}
