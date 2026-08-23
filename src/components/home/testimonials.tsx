"use client";

import { useState } from "react";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

export type Testimonial = { name: string; role: string; quote: string };

/**
 * 04_DESIGN_SYSTEM.md §6 — quote at display-m weight 400, centred, with a large
 * quote glyph in accent-tint above it.
 *
 * No avatar photographs. §11 permits real buyer photographs only, and inventing
 * stock faces for testimonials on a site whose whole argument is honesty would
 * be the wrong place to save time. Initials stand in until the client supplies
 * real ones.
 */
export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [active, setActive] = useState(0);
  if (testimonials.length === 0) return null;

  const current = testimonials[active];

  return (
    <Section>
      <Container>
        <SectionHeading
          heading="What buyers say"
          supporting="Three buyers who completed with us, in their words. Their full names and estates are published with their permission."
        />

        <figure className="mt-16 lg:mt-20">
          <QuoteGlyph />
          <blockquote className="mx-auto mt-8 max-w-[46ch] text-center text-display-m text-ink">
            {current.quote}
          </blockquote>
          <figcaption className="sr-only">
            {current.name}, {current.role}
          </figcaption>
        </figure>

        <ul className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {testimonials.map((testimonial, index) => (
            <li key={testimonial.name}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                className={cn(
                  "flex items-center gap-4 rounded-full p-1",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full text-caption transition-colors",
                    index === active
                      ? "bg-accent text-white"
                      : "bg-accent-tint text-accent",
                  )}
                >
                  {initials(testimonial.name)}
                </span>
                <span className="text-left">
                  <span className="block text-body font-medium text-ink">
                    {testimonial.name}
                  </span>
                  <span className="block text-caption text-ink-muted">
                    {testimonial.role}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function QuoteGlyph() {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      aria-hidden="true"
      className="mx-auto h-10 w-16 text-accent-tint"
    >
      <path
        d="M0 32V16C0 7.2 6.4 0.8 15.2 0v6.4C10.4 7.2 7.2 10.4 7.2 15.2H16V32H0zm32 0V16C32 7.2 38.4 0.8 47.2 0v6.4c-4.8 0.8-8 4-8 8.8H48V32H32z"
        fill="currentColor"
      />
    </svg>
  );
}
