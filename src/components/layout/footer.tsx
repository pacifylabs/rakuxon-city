import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/field";

/**
 * 04_DESIGN_SYSTEM.md §6 — a `deep` bar across the full width, with
 * "A Rakuxon company" in the bottom rule. That line is the only Rakuxon
 * reference anywhere on the site.
 *
 * Four columns rather than three: the site links used to sit in a single wide
 * row beneath everything, where they read as an afterthought rather than as
 * navigation. They are now a column beside the contact details, which is where
 * someone looking for a section actually looks.
 *
 * The investor lane is linked from here and from the homepage strip, and
 * nowhere else — FR-4.1 keeps it out of primary navigation deliberately, so
 * that it stays a quiet credibility surface rather than a public pitch. It is
 * given a button here because it is the footer's one real call to action.
 */
const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "X", href: "https://x.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

/** Navigation only. Privacy and Terms are notices, and sit in the bottom rule. */
const siteLinks = [
  { label: "Land", href: "/land" },
  { label: "Homes", href: "/homes" },
  { label: "Estates", href: "/estates" },
  // 06_FEATURE_VIDEO_TOURS.md §6 — primary navigation is unchanged; /tours is
  // reached from here, from the homepage section, and from each video block.
  { label: "Video tours", href: "/tours" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="relative z-10 bg-deep">
      <Container>
        <div className="py-16 lg:py-20">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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

              {/*
                FR-4.1's second permitted entry point, and the only call to
                action down here. Outlined rather than filled: a solid accent
                button on the deep bar would pull harder than anything on the
                page above it.
              */}
              <Link
                href="/invest"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-canvas/30 px-5 text-body text-canvas transition-colors hover:border-canvas hover:bg-canvas/10 focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none"
              >
                Partner with us
              </Link>
            </div>

            <nav aria-label="Footer">
              <p className="text-eyebrow text-canvas/75">Explore</p>
              <ul className="mt-5 space-y-3">
                {siteLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-canvas/90 transition-colors hover:text-canvas"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="text-eyebrow text-canvas/75">Share with us</p>
              <ul className="mt-5 space-y-3">
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
              <div className="mt-5 flex flex-col gap-3">
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

          <div className="mt-16 flex flex-col gap-4 border-t border-canvas/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption text-canvas/75">
              © {new Date().getFullYear()} Rakuxon City. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-caption text-canvas/75 transition-colors hover:text-canvas"
                >
                  {link.label}
                </Link>
              ))}
              <p className="text-caption text-canvas/75">A Rakuxon company</p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
