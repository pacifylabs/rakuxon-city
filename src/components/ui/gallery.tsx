"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type GalleryImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Listing and estate imagery, with a lightbox. 04_DESIGN_SYSTEM.md §8 sets the
 * order for a home: exterior first, then interiors, then the floor plan — the
 * gallery renders whatever order the media library gives it.
 */
export function Gallery({
  images,
  className,
}: {
  images: GalleryImage[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpen((current) =>
        current === null
          ? null
          : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  if (images.length === 0) return null;

  const [lead, ...rest] = images;
  const sideTiles = rest.slice(0, 2);

  /*
   * The mosaic only works when there is something to put beside the lead.
   *
   * Every listing currently carries exactly one photograph, and the old layout
   * always reserved three columns and gave the lead two of them — so a
   * single-image listing rendered two thirds of a row and a third of nothing.
   * That empty third is the dead space the client marked on the detail page.
   *
   * So the shape follows the count: one image takes the full width at a wider
   * ratio, two split the row, three or more get the mosaic as designed.
   */
  const layout =
    sideTiles.length === 0
      ? "single"
      : sideTiles.length === 1
        ? "pair"
        : "mosaic";

  return (
    <div className={className}>
      <div
        className={cn(
          "grid gap-4",
          layout === "pair" && "lg:grid-cols-2",
          layout === "mosaic" && "lg:grid-cols-3",
        )}
      >
        <GalleryTile
          image={lead}
          onOpen={() => setOpen(0)}
          className={cn(
            layout === "single" && "aspect-16/9",
            layout === "mosaic" && "lg:col-span-2 lg:row-span-2",
          )}
          sizes={
            layout === "single"
              ? "(min-width: 1280px) 1200px, 100vw"
              : "(min-width: 1024px) 60vw, 100vw"
          }
          priority
        />
        {sideTiles.map((image, index) => (
          <GalleryTile
            key={image.url}
            image={image}
            onOpen={() => setOpen(index + 1)}
            sizes="(min-width: 1024px) 30vw, 100vw"
          />
        ))}
      </div>

      {open !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[open].alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-deep/90 p-6"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close gallery"
            className="absolute top-6 right-6 text-2xl leading-none text-canvas"
          >
            ×
          </button>
          <div
            className="relative max-h-full w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[open].url}
              alt={images[open].alt}
              width={images[open].width}
              height={images[open].height}
              className="h-auto w-full rounded-image-l object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GalleryTile({
  image,
  onOpen,
  className,
  sizes,
  priority,
}: {
  image: GalleryImage;
  onOpen: () => void;
  className?: string;
  /** Set per layout — a full-width lead and a third-width tile differ a lot. */
  sizes: string;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative aspect-4/3 overflow-hidden rounded-card",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        className,
      )}
    >
      <Image
        src={image.url}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
      />
    </button>
  );
}
