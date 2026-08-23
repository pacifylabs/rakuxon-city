"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §6 — hairline divider between rows, question at
 * `heading`, a +/− glyph right-aligned in accent, body copy in ink-secondary.
 */
export type AccordionItem = {
  question: string;
  answer: string;
};

export function Accordion({
  items,
  className,
  defaultOpenIndex = 0,
}: {
  items: AccordionItem[];
  className?: string;
  defaultOpenIndex?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpenIndex);
  const baseId = useId();

  return (
    <div className={cn("divide-y divide-hairline", className)}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className={cn(
                  "flex w-full items-center justify-between gap-6 py-5 text-left text-body text-ink",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                )}
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-lg leading-none text-accent"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-5"
            >
              <p className="max-w-[62ch] text-body text-ink-secondary">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
