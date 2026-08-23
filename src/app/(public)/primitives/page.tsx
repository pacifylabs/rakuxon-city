import type { Metadata } from "next";
import { Accordion } from "@/components/ui/accordion";
import {
  Badge,
  BuildStageBadge,
  StatusBadge,
  TitleTypeBadge,
} from "@/components/ui/badge";
import { Button, ButtonLink, IconAction } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { Container, Section } from "@/components/ui/container";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { Gallery } from "@/components/ui/gallery";
import { PriceDisplay } from "@/components/ui/price-display";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ListingCard } from "@/components/listings/listing-card";
import { getSampleListings } from "@/lib/listings";
import { BuildStage, ListingStatus, TitleType } from "@/generated/prisma/enums";

/**
 * Phase 2 verification surface — every primitive in every variant, checked
 * side by side against docs/reference/05_reference-ui.png.
 *
 * Not part of the site. It carries noindex and is deleted at the Phase 8
 * launch gate.
 */
export const metadata: Metadata = {
  title: "Primitives — Rakuxon City",
  robots: { index: false, follow: false },
};

export default async function PrimitivesPage() {
  const listings = await getSampleListings(6);
  const land = listings.find((l) => l.type === "LAND");
  const home = listings.find((l) => l.type === "HOME");

  return (
    <main className="relative z-10">
      <Container>
        <Section>
          <p className="text-eyebrow text-ink-muted">Internal</p>
          <h1 className="mt-4 max-w-[18ch] text-display-xl text-ink">
            Design primitives
          </h1>
          <p className="mt-6 max-w-[56ch] text-body text-ink-secondary">
            Every variant built in Phase 2, rendered against the tokens in
            design system §10. Nothing here uses a font weight above 500, and no
            listing card carries a shadow.
          </p>
        </Section>

        <Row label="Type scale">
          <div className="space-y-4">
            <p className="text-display-xl text-ink">Display xl — 64 / 1.05</p>
            <p className="text-display-l text-ink">Display l — 48 / 1.1</p>
            <p className="text-display-m text-ink">Display m — 36 / 1.15</p>
            <p className="text-heading text-ink">Heading — 24 / 1.25</p>
            <p className="text-body-l text-ink-secondary">Body l — 17 / 1.6</p>
            <p className="text-body text-ink-secondary">Body — 15 / 1.6</p>
            <p className="text-caption text-ink-muted">Caption — 13 / 1.5</p>
            <p className="text-eyebrow text-ink-muted">Eyebrow — 12 / 1.4</p>
          </div>
        </Row>

        <Row label="Colour">
          <div className="flex flex-wrap gap-3">
            {[
              ["canvas", "bg-canvas"],
              ["surface", "bg-surface"],
              ["accent", "bg-accent"],
              ["accent-hover", "bg-accent-hover"],
              ["accent-tint", "bg-accent-tint"],
              ["hairline", "bg-hairline"],
              ["ink", "bg-ink"],
              ["ink-secondary", "bg-ink-secondary"],
              ["ink-muted", "bg-ink-muted"],
              ["deep", "bg-deep"],
            ].map(([name, className]) => (
              <div key={name} className="w-32">
                <div
                  className={`h-16 rounded-card border border-hairline ${className}`}
                />
                <p className="mt-2 text-caption text-ink-muted">{name}</p>
              </div>
            ))}
          </div>
        </Row>

        <Row label="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Explore properties</Button>
            <Button variant="secondary">Learn more</Button>
            <Button variant="text">Explore reviews</Button>
            <IconAction href="#" label="Open listing" />
            <Button variant="primary" disabled>
              Coming soon
            </Button>
            <ButtonLink variant="secondary" href="#">
              Book an inspection
            </ButtonLink>
          </div>
        </Row>

        <Row label="Badges">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {Object.values(TitleType).map((titleType) => (
                <TitleTypeBadge key={titleType} titleType={titleType} />
              ))}
            </div>
            <p className="text-caption text-ink-muted">
              Survey only renders in the neutral palette, not sage — §7.
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.values(BuildStage).map((buildStage) => (
                <BuildStageBadge key={buildStage} buildStage={buildStage} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.values(ListingStatus).map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
            <Badge className="bg-accent-tint text-accent">Base badge</Badge>
          </div>
        </Row>

        <Row label="Price display">
          <div className="flex flex-wrap items-end gap-12">
            <PriceDisplay price="18500000" priceOnRequest={false} />
            <PriceDisplay price={null} priceOnRequest />
            <PriceDisplay
              price="185000000"
              priceOnRequest={false}
              size="detail"
            />
          </div>
        </Row>

        <Row label="Section heading — asymmetric pairing">
          <div className="space-y-16">
            <SectionHeading
              heading={<>Largest collection of land parcels</>}
              supporting="Discover the largest collection of land parcels available on the market today."
              action={<Button variant="secondary">Learn more</Button>}
              note="Our portfolio spans three estates across Lagos, Ogun and the FCT."
            />
            <SectionHeading
              align="right"
              heading={<>Spotlight on prime real estate</>}
              supporting="Discover our top picks of the week with our must-see properties collection."
              action={<Button variant="secondary">Explore now</Button>}
            />
          </div>
        </Row>

        <Row label="Form controls">
          <div className="grid max-w-xl gap-5">
            <Field label="Full name" htmlFor="p-name">
              <Input id="p-name" placeholder="Adaeze Nwosu" />
            </Field>
            <Field
              label="Phone number"
              htmlFor="p-phone"
              error="Enter a phone number we can reach you on, like 0803 123 4567"
            >
              <Input id="p-phone" defaultValue="0803" error />
            </Field>
            <Field label="Preferred estate" htmlFor="p-estate">
              <Select id="p-estate" defaultValue="">
                <option value="" disabled>
                  Choose an estate
                </option>
                <option>Emerald Ridge Estate</option>
                <option>Cornerstone Gardens</option>
                <option>Sabon Lugbe Court</option>
              </Select>
            </Field>
            <Field label="Message" htmlFor="p-message">
              <Textarea
                id="p-message"
                placeholder="Tell us what you're looking for"
              />
            </Field>
            <Field label="Disabled field" htmlFor="p-disabled">
              <Input
                id="p-disabled"
                disabled
                placeholder="Available from Phase 6"
              />
            </Field>
            <Checkbox
              id="p-consent"
              label="I have read the privacy policy and consent to being contacted about this enquiry."
            />
          </div>
        </Row>

        <Row label="Listing cards">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
          <p className="mt-4 text-caption text-ink-muted">
            Land leads with the title ribbon, homes with the build stage. Body
            order is identical across both.
          </p>
        </Row>

        <Row label="Listing card — with icon action">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {land ? <ListingCard listing={land} showAction /> : null}
            {home ? <ListingCard listing={home} showAction /> : null}
          </div>
        </Row>

        <Row label="Carousel">
          <Carousel label="sample listings" itemClassName="w-[300px]">
            {listings.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </Carousel>
        </Row>

        <Row label="Accordion">
          <Accordion
            items={[
              {
                question: "What services do you offer?",
                answer:
                  "We sell serviced plots and completed homes across three estates, and we handle the documentation end of the transaction rather than leaving it to the buyer.",
              },
              {
                question: "Are there any hidden fees?",
                answer:
                  "No. Survey, deed and estate development charges are quoted with the plot price before you commit to anything.",
              },
              {
                question: "What is the process for buying land?",
                answer:
                  "Enquire, inspect the plot, review the documentation, then pay in full or on an agreed plan. Allocation follows the final instalment.",
              },
            ]}
          />
        </Row>

        <Row label="Gallery and lightbox">
          <Gallery
            images={[
              {
                url: "/images/placeholders/estate-emerald-ridge.png",
                alt: "Aerial view of Emerald Ridge Estate — photography pending",
                width: 1600,
                height: 1000,
              },
              {
                url: "/images/placeholders/land-01.png",
                alt: "Plot A14 showing boundary markers — photography pending",
                width: 1200,
                height: 900,
              },
              {
                url: "/images/placeholders/home-01.png",
                alt: "Completed four-bedroom detached house — photography pending",
                width: 1200,
                height: 900,
              },
            ]}
          />
        </Row>

        <Row label="Scroll reveal">
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <ScrollReveal key={index} delayMs={index * 60}>
                <div className="rounded-card border border-hairline bg-surface p-6 text-body text-ink-secondary">
                  Revealed with a 12px rise, staggered {index * 60}ms. Held
                  still entirely under prefers-reduced-motion.
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Row>

        <Row label="Elevation — the only two on the site">
          <div className="flex flex-wrap gap-6">
            <div className="max-w-sm rounded-card bg-surface p-6 shadow-lift">
              <p className="text-heading text-ink">Hassle-free documentation</p>
              <p className="mt-3 text-body text-ink-secondary">
                The floating callout that overlaps the hero imagery.
              </p>
            </div>
            <div className="max-w-sm rounded-card bg-surface p-6 shadow-lift">
              <p className="text-heading text-ink">Find your answers here</p>
              <p className="mt-3 text-body text-ink-secondary">
                The FAQ panel that overlaps the image collage.
              </p>
            </div>
          </div>
        </Row>
      </Container>
    </main>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Section className="border-t border-hairline">
      <p className="mb-8 text-eyebrow text-ink-muted">{label}</p>
      {children}
    </Section>
  );
}
