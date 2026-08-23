import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/field";

/**
 * 04_DESIGN_SYSTEM.md §6 — a `deep` bar across the full width, three columns
 * (contact, socials, newsletter), and "A Rakuxon company" in the bottom rule.
 * That line is the only Rakuxon reference anywhere on the site.
 *
 * The investor lane is linked here and from the homepage strip, and nowhere
 * else (FR-4.1).
 */
const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "X", href: "https://x.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

const siteLinks = [
  { label: "Land", href: "/land" },
  { label: "Homes", href: "/homes" },
  { label: "Estates", href: "/estates" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Partner with us", href: "/invest" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="relative z-10 bg-deep">
      <Container>
        <div className="py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-6">
            <div>
              <p className="text-eyebrow text-canvas/75">Contact us</p>
              <ul className="mt-5 space-y-3">
                <li>
                  <a
                    href="mailto:hello@rakuxoncity.com"
                    className="text-body text-canvas/90 transition-colors hover:text-canvas"
                  >
                    hello@rakuxoncity.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+2348000000000"
                    className="text-body text-canvas/90 transition-colors hover:text-canvas"
                  >
                    {/* TODO: real figures — client contact details before launch. */}
                    +234 800 000 0000
                  </a>
                </li>
                <li className="text-body text-canvas/90">
                  Lagos · Ogun · FCT Abuja
                </li>
              </ul>
            </div>

            <div>
              <p className="text-eyebrow text-canvas/75">Share with us</p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      rel="noreferrer noopener"
                      target="_blank"
                      className="text-body text-canvas/90 transition-colors hover:text-canvas"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-eyebrow text-canvas/75">Newsletter</p>
              {/* Not wired up until Phase 6. Disabled rather than accepting an
                  address it would silently discard. */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  disabled
                  aria-label="Email address"
                  placeholder="Email address"
                  className="border-canvas/20 bg-canvas/5 text-canvas placeholder:text-canvas/40 disabled:bg-canvas/5 disabled:text-canvas/40"
                />
                <button
                  type="button"
                  disabled
                  className="min-h-11 shrink-0 cursor-not-allowed rounded-full border border-canvas/20 px-6 text-body text-canvas/40"
                >
                  Coming soon
                </button>
              </div>
              <p className="mt-3 text-caption text-canvas/75">
                Sign-up opens when the enquiry system goes live.
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="mt-16 border-t border-canvas/15 pt-8"
          >
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-caption text-canvas/75 transition-colors hover:text-canvas"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption text-canvas/75">
              © {new Date().getFullYear()} Rakuxon City. All rights reserved.
            </p>
            <p className="text-caption text-canvas/75">A Rakuxon company</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
