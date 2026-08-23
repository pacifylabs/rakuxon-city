import Image from "next/image";
import { Accordion } from "@/components/ui/accordion";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

type CollageImage = { url: string; alt: string; width: number; height: number };

/**
 * The FAQ panel over the image collage — elevation 2 of 2 on this page
 * (04_DESIGN_SYSTEM.md §5). Nothing else below the featured estate block is
 * allowed to lift.
 *
 * Answers are deliberately concrete. A buyer arriving here is checking whether
 * we will be straight with them, and vague reassurance reads as evasion.
 */
const questions = [
  {
    question: "How do I know the title on a plot is genuine?",
    answer:
      "Every listing states its title type and survey number, and lists the documents we hold. You are welcome to run your own search at the state land registry before paying anything, and we will provide copies for that purpose.",
  },
  {
    question: "What does 'survey only' mean on a listing?",
    answer:
      "It means the plot has a registered survey but the excision or consent has not yet been granted. It is a weaker position than a Certificate of Occupancy and the price reflects it. We list those plots rather than hiding them, and we say so on the card.",
  },
  {
    question: "Are there charges beyond the plot price?",
    answer:
      "Survey, deed and estate development charges are quoted alongside the plot price before you commit. There is no separate fee introduced after allocation.",
  },
  {
    question: "Can I pay in instalments?",
    answer:
      "Most listings carry a payment plan, with the deposit percentage and duration set per listing and shown on the listing itself. Allocation follows the final instalment.",
  },
  {
    question: "Can I visit before I buy?",
    answer:
      "Yes, and we would rather you did. Inspections run on weekdays and Saturday mornings, and you walk the actual plot, not a sample one.",
  },
];

export function Faq({ collage }: { collage: CollageImage[] }) {
  return (
    <Section>
      <Container>
        <SectionHeading
          align="right"
          heading="Your questions, answered plainly"
          supporting="The things buyers ask before they trust us with money. If your question is not here, ask it — we would rather answer it now than after you have paid."
        />

        {/*
          Panel and collage share one grid row and overlap by column, rather
          than the panel being absolutely positioned. The accordion is taller
          than the collage, so absolute positioning lets it escape the section
          and land on top of whatever follows.
        */}
        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-8 lg:col-start-5 lg:row-start-1 lg:gap-6">
            {collage.slice(0, 3).map((image, index) => (
              <div key={image.url} className={tileClass(index)}>
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 22vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Elevation 2 of 2. */}
          <div className="z-10 -mt-8 rounded-card bg-surface p-6 shadow-lift lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:mt-16 lg:p-10">
            <p className="text-heading text-ink">Find your answers here</p>
            <Accordion items={questions} className="mt-4" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** 3:4 portrait tiles either side of a 4:3, per the aspect ratios in §8. */
function tileClass(index: number) {
  const base = "rounded-card relative overflow-hidden";
  return index === 1 ? `${base} aspect-4/3 sm:mt-10` : `${base} aspect-3/4`;
}
