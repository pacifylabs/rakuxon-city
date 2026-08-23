import { ButtonLink } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ListingCard,
  type ListingCardData,
} from "@/components/listings/listing-card";

/**
 * 01_SITE_ARCHITECTURE.md §5.1 item 3 — featured stock mixed from both tracks,
 * so a visitor who has not chosen a lane still sees inventory.
 */
export function Spotlight({ listings }: { listings: ListingCardData[] }) {
  if (listings.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          align="right"
          heading="Spotlight on available stock"
          supporting="A mixed selection from all three estates, refreshed as inventory moves."
          action={
            <ButtonLink variant="secondary" href="/land">
              Explore now
            </ButtonLink>
          }
          note="Sold listings stay visible. Stock that moves is the clearest evidence an estate is real."
        />

        <Carousel
          label="spotlight listings"
          className="mt-12 lg:mt-16"
          itemClassName="w-[280px] sm:w-[320px] lg:w-[360px]"
        >
          {listings.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} showAction />
          ))}
        </Carousel>
      </Container>
    </Section>
  );
}
