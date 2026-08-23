"use client";

import Image from "next/image";
import Link from "next/link";
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

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20">
      <Container>
        <div className="flex items-center justify-between gap-6 py-6">
          <Link href="/" className="shrink-0" aria-label="Rakuxon City — home">
            <Image
              src="/logo.png"
              alt="Rakuxon City"
              width={2172}
              height={724}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body text-ink-secondary transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
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
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-4 text-body text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
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
