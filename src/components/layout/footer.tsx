import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NewsletterSignup } from "@/components/layout/newsletter-signup";

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
  // CC BY requires attribution "in a manner reasonable to the medium". The
  // on-image label is gone, so this link is what keeps 22 of the 25 stand-in
  // photographs inside their licence.
  { label: "Image credits", href: "/credits" },
];

export function Footer() {
  return (
    <footer className="relative z-10 bg-deep">
      <Container>
        <div className="py-16 lg:py-20">
          {/*
            12 columns, not four equal quarters. The contact column carries a
            call to action and the newsletter carries a field, while the two
            link columns are single words — equal quarters gave the widest space
            to the content that needed least. 4 / 2 / 2 / 4 tracks the content.

            Two columns at `sm`, four at `lg`, and the gold rule above the
            bottom row ties it to the rest of the palette.
          */}
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-eyebrow text-gold-on-deep">Contact us</p>
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
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-gold-on-deep px-5 text-body text-gold-on-deep transition-colors hover:bg-gold-on-deep/10 focus-visible:ring-2 focus-visible:ring-gold-on-deep focus-visible:outline-none"
              >
                Partner with us
              </Link>
            </div>

            <nav aria-label="Footer" className="lg:col-span-2">
              <p className="text-eyebrow text-gold-on-deep">Explore</p>
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

            <div className="lg:col-span-2">
              <p className="text-eyebrow text-gold-on-deep">Share with us</p>
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

            <div className="lg:col-span-4">
              <p className="text-eyebrow text-gold-on-deep">Newsletter</p>
              {/* Live-looking, and honest on press — see NewsletterSignup. */}
              <NewsletterSignup />
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-gold-on-deep/25 pt-8 sm:flex-row sm:items-center sm:justify-between">
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
