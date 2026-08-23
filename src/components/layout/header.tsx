"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
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

export function Header({
  logo,
}: {
  /** Resolved from the `site.logo` placement, so the admin can swap it. */
  logo: { url: string; alt: string; width: number; height: number };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative z-20">
      <Container>
        <div className="flex items-center justify-between gap-6 py-6">
          <Link href="/" className="shrink-0" aria-label="Rakuxon City — home">
            <Image
              src={logo.url}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              priority
              // Renders 40px tall on desktop, 32px on a phone. Without an
              // explicit `sizes` the browser picks a candidate sized for the
              // viewport and the mark becomes the heaviest asset on the page.
              sizes="(min-width: 640px) 216px, 168px"
              className="h-10 w-auto sm:h-13"
            />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navigation.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative py-1 text-body transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                        active
                          ? "text-ink"
                          : "text-ink-secondary hover:text-ink",
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
                          "absolute -bottom-1 left-0 h-px w-full origin-left bg-accent transition-transform duration-200",
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
            <ButtonLink
              variant="secondary"
              href="/contact"
              className="hidden sm:inline-flex"
            >
              Contact us
            </ButtonLink>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className={cn(
                "flex size-10 items-center justify-center rounded-full border border-hairline text-ink lg:hidden",
                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
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
          className="border-t border-hairline lg:hidden"
        >
          <Container>
            <nav aria-label="Primary, mobile" className="py-4">
              <ul className="divide-y divide-hairline">
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
                          active ? "text-accent" : "text-ink",
                        )}
                      >
                        {item.label}
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full bg-accent"
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
                    className="block py-4 text-body text-accent"
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
