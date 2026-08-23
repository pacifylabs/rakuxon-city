import Image from "next/image";
import Link from "next/link";
import {
  BuildStageBadge,
  StatusBadge,
  TitleTypeBadge,
} from "@/components/ui/badge";
import { IconAction } from "@/components/ui/button";
import { PriceDisplay } from "@/components/ui/price-display";
import { cn } from "@/lib/cn";
import { formatArea } from "@/lib/format";
import { isPlaceholder } from "@/lib/media";
import type {
  BuildStage,
  ListingStatus,
  ListingType,
  PlotUnit,
  TitleType,
} from "@/generated/prisma/enums";

export type ListingCardData = {
  slug: string;
  type: ListingType;
  title: string;
  description: string;
  location: string;
  state: string;
  price: string | number | null;
  priceOnRequest: boolean;
  status: ListingStatus;
  image: { url: string; alt: string } | null;
  land: {
    plotSize: string | number;
    plotUnit: PlotUnit;
    titleType: TitleType;
  } | null;
  home: { bedrooms: number; bathrooms: number; buildStage: BuildStage } | null;
};

/**
 * 04_DESIGN_SYSTEM.md §6. Surface fill, hairline border, and no shadow —
 * §11 forbids elevation here, and the two lifted elements on the homepage are
 * spent elsewhere.
 *
 * The body order below is fixed across both tracks so a buyer scanning a mixed
 * grid reads the same things in the same places. On land the title ribbon leads,
 * above the name and before the price (§7): title is the anxiety, so it is the
 * first thing answered.
 */
export function ListingCard({
  listing,
  showAction = false,
  className,
}: {
  listing: ListingCardData;
  /** The 40px circular action, bottom-right on featured cards (§6). */
  showAction?: boolean;
  className?: string;
}) {
  const href = `/${listing.type === "LAND" ? "land" : "homes"}/${listing.slug}`;
  const sold = listing.status === "SOLD";

  const subline =
    listing.type === "LAND" && listing.land
      ? `${formatArea(listing.land.plotSize, listing.land.plotUnit)} · ${listing.location}, ${listing.state}`
      : listing.home
        ? `${listing.home.bedrooms} bed · ${listing.home.bathrooms} bath · ${listing.location}, ${listing.state}`
        : `${listing.location}, ${listing.state}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card border border-hairline bg-surface",
        "transition-colors duration-300 hover:border-ink-muted",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        {listing.image ? (
          <Image
            src={listing.image.url}
            alt={listing.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]",
              sold && "opacity-75",
            )}
          />
        ) : (
          <div className="size-full bg-accent-tint" />
        )}

        {listing.image && isPlaceholder(listing.image.url) ? (
          // Sits where §8 puts the "Artist's impression" label. Placeholder
          // imagery is never passed off as a photograph of the actual plot.
          <p className="absolute bottom-2 left-2 rounded-full bg-canvas/85 px-2 py-0.5 text-caption text-ink-muted">
            Photography pending
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* 1 — title ribbon on land, build stage on homes */}
        <div>
          {listing.type === "LAND" && listing.land ? (
            <TitleTypeBadge titleType={listing.land.titleType} />
          ) : listing.home ? (
            <BuildStageBadge buildStage={listing.home.buildStage} />
          ) : null}
        </div>

        {/* 2 — name */}
        <h3 className="text-heading text-ink">
          <Link
            href={href}
            className="after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none"
          >
            {listing.title}
          </Link>
        </h3>

        {/* 3 — one-line description */}
        <p className="line-clamp-2 text-caption text-ink-secondary">
          {listing.description}
        </p>

        {/* 4 — price, or the explicit on-request state. Never blank (§11). */}
        <PriceDisplay
          price={listing.price}
          priceOnRequest={listing.priceOnRequest}
          className="mt-1"
        />

        {/* 5 — sub-line */}
        <p className="text-caption text-ink-muted">{subline}</p>

        {/* 6 — status, bottom-left */}
        <div className="mt-auto flex items-end justify-between gap-4 pt-3">
          <StatusBadge status={listing.status} />
          {showAction ? (
            <IconAction
              href={href}
              label={`View ${listing.title}`}
              className="relative z-10"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
