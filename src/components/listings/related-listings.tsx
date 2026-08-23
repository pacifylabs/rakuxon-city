import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ListingCard,
  type ListingCardData,
} from "@/components/listings/listing-card";

/** FR-1.10 — three from the same estate, falling back to the same location. */
export function RelatedListings({
  listings,
  track,
}: {
  listings: ListingCardData[];
  track: "land" | "homes";
}) {
  if (listings.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          heading={
            track === "land" ? "Other plots nearby" : "Other homes nearby"
          }
          supporting="From the same estate where we have stock, and from the same area otherwise."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.slug}
              listing={listing}
              className="h-full"
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
