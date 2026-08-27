"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/cn";

/**
 * Primary navigation, per 01_SITE_ARCHITECTURE.md §4.
 *
 * `/invest` is deliberately absent. FR-4.1 reaches the investor lane from the
 * footer and the homepage strip only — keeping it out of primary navigation is
 * part of what keeps that page a quiet credibility surface rather than a public
 * pitch.
 */
const navigation = [
  { href: "/land", label: "Land" },
  { href: "/homes", label: "Homes" },
  { href: "/estates", label: "Estates" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

/**
 * Which nav item owns the current page.
 *
 * A prefix match, not equality: `/land/emerald-ridge-plot-a14` belongs to Land.
 * This carries the weight breadcrumbs used to — it is the only thing on a
 * detail page now saying which section you are in — so a detail page has to
 * light its parent, not nothing.
 *
 * `/` is matched exactly, or every route would claim it.
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 07_FEATURE_HERO.md §6 — the header now sits on the photograph, but ONLY on
 * the homepage. Every other route keeps the exact header this file rendered
 * before the hero feature, unchanged: static position, `background` ground,
 * `foreground` labels, no scroll listener, no observer. That branch below
 * (`!overlay`) is the old markup verbatim.
 *
 * On the homepage, the header becomes `fixed` at the very top — full-bleed
 * means the hero photograph runs behind it, not below it — and carries a
 * `scrolled` skin that flips when the hero's own sentinel
 * (`[data-hero-end]`, rendered by Hero) leaves the viewport. Reaching into
 * another component's DOM by a data-attribute rather than a shared ref is a
 * deliberate looser coupling: Header and Hero are siblings two levels apart
 * (Header sits in the shared public layout, Hero is inside `children`), and
 * a data-attribute selector is simpler than threading a ref or a context
 * across that boundary for what is, in the end, one boolean.
 */
export function Header({
  logo,
}: {
  /** Resolved from the `site.logo` placement, so the admin can swap it. */
  logo: { url: string; alt: string; width: number; height: number };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const sentinel = document.querySelector("[data-hero-end]");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isHome]);

  // The overlay skin only actually applies before the hero has scrolled past.
  const overlay = isHome && !pastHero;

  return (
    <header
      className={cn(
        "z-30",
        isHome ? "fixed inset-x-0 top-0" : "relative",
        // The solid state needs its own ground and a hairline, matching what
        // every other page's header has always had.
        isHome && pastHero && "border-b border-line bg-background",
      )}
    >
      <Container>
        <div className="flex items-center justify-between gap-6 py-6">
          <Link href="/" className="shrink-0" aria-label="Rakuxon City — home">
            {/*
              The logo is a fixed-colour raster mark (navy + gold), not a
              monochrome wordmark — §6 assumes a logo that can switch to
              `ivory-light`, which this can't do. A translucent chip behind it
              keeps it legible over a rotating photograph without inventing a
              new brand asset. Gone once scrolled past, where the ground is
              solid `background` and the mark already reads fine on it, same
              as every other page.
            */}
            <span
              className={cn(
                "inline-flex rounded-full transition-colors",
                overlay && "bg-white/90 px-3 py-1.5 backdrop-blur-sm",
              )}
            >
              <Image
                src={logo.url}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                priority
                sizes="(min-width: 640px) 216px, 168px"
                className="h-10 w-auto sm:h-13"
              />
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul
              className={cn(
                "flex items-center gap-8 transition-colors",
                overlay &&
                  "rounded-full bg-white/90 px-6 py-2.5 backdrop-blur-sm",
              )}
            >
              {navigation.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative py-1 text-body transition-colors",
                        "focus-visible:ring-2 focus-visible:outline-none",
                        overlay
                          ? cn(
                              "focus-visible:ring-foreground",
                              active
                                ? "text-foreground"
                                : "text-muted hover:text-foreground",
                            )
                          : cn(
                              "focus-visible:ring-foreground",
                              active
                                ? "text-foreground"
                                : "text-muted hover:text-foreground",
                            ),
                      )}
                    >
                      {item.label}
                      {/*
                        A rule under the active item rather than a colour change
                        alone: colour on its own is not an accessible way to
                        carry state, and `aria-current` covers screen readers
                        but not someone who cannot distinguish the two greys.
                      */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute -bottom-1 left-0 h-px w-full origin-left transition-transform duration-200",
                          overlay ? "bg-foreground" : "bg-foreground",
                          active ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme toggle button */}
            <ThemeToggle />

            {/*
              07_FEATURE_HERO.md §6 — Contact us stays champagne fill /
              charcoal label in BOTH header states on the homepage, unlike
              every other button on the site, where accent fill is reserved
              for a single per-view action. That is the doc's explicit
              instruction for this one persistent control, not an oversight —
              flagged in the delivery notes as a real tension with the
              site-wide "one accent action per view" rule once the page has
              scrolled to a section with its own accent button in view.
              Off the homepage this is exactly the `secondary` button it has
              always been.
            */}
            {isHome ? (
              <Link
                href="/contact"
                className={cn(
                  "hidden min-h-11 items-center justify-center rounded-full bg-accent px-6 py-2.5 text-body font-medium text-foreground transition-colors hover:bg-accent-hover sm:inline-flex",
                  "focus-visible:ring-2 focus-visible:ring-ivory-light focus-visible:ring-offset-2 focus-visible:outline-none",
                )}
              >
                Contact us
              </Link>
            ) : (
              <ButtonLink
                variant="secondary"
                href="/contact"
                className="hidden sm:inline-flex"
              >
                Contact us
              </ButtonLink>
            )}

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className={cn(
                "flex size-10 items-center justify-center rounded-full lg:hidden",
                "focus-visible:ring-2 focus-visible:outline-none",
                overlay
                  ? "bg-white/90 text-foreground backdrop-blur-sm focus-visible:ring-foreground"
                  : "border border-line text-foreground focus-visible:ring-foreground",
              )}
            >
              <span className="sr-only">
                {open ? "Close menu" : "Open menu"}
              </span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="size-4"
              >
                {open ? (
                  <path
                    d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M2.5 5h11M2.5 11h11"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {open ? (
        <div
          id="mobile-navigation"
          // Solid regardless of overlay state — this panel floats over the
          // hero photograph when open early in the scroll, and a translucent
          // panel over a rotating image is exactly what §4's scrim exists to
          // avoid text sitting on.
          className="border-t border-line bg-background lg:hidden"
        >
          <Container>
            <nav aria-label="Primary, mobile" className="py-4">
              <ul className="divide-y divide-line">
                {navigation.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between py-4 text-body",
                          active ? "text-accent-text" : "text-foreground",
                        )}
                      >
                        {item.label}
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full bg-foreground"
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="block py-4 text-body text-accent-text"
                  >
                    Contact us
                  </Link>
                </li>
              </ul>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
