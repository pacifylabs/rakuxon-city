import Link from "next/link";
import { Container, Section } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { VideoCard, type VideoCardData } from "@/components/video/video-card";

/**
 * FR-V1.3 — the homepage video section, between Spotlight and Testimonials.
 *
 * DEVIATION, at the client's explicit instruction: 04_DESIGN_SYSTEM.md §4 and
 * 06_FEATURE_VIDEO_TOURS.md §5 both call for the asymmetric heading pairing
 * used by every other section on this page, and §4 says "never centred". The
 * client reviewed the built section and asked for it centred instead. Their
 * call, recorded here so the next reader knows it was a decision rather than a
 * component someone forgot to use.
 */
export function VideoTours({ videos }: { videos: VideoCardData[] }) {
  // FR-V1.3 — one card is not a section, it is an orphan. Below two, the whole
  // block is absent rather than rendered thin.
  if (videos.length < 2) return null;

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-[52ch] text-center">
          <p className="mb-4 text-eyebrow text-muted">Video tours</p>
          <h2 className="text-display-l text-foreground">See it before you visit</h2>
          <p className="mx-auto mt-6 max-w-[46ch] text-body text-muted">
            Most buyers cannot walk a plot before they commit, and diaspora
            buyers never can. A tour shows the access road, the boundaries and
            what is already built around it.
          </p>
        </div>

        {/*
          2×2 at lg per §5. Below md the cards scroll horizontally rather than
          stacking into a very tall column — four 16:9 posters stacked is most
          of a phone screen each, and the section stops reading as one thing.
        */}
        <ul
          className={
            "mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:mt-16 " +
            "md:grid md:grid-cols-2 md:overflow-visible md:pb-0"
          }
        >
          {videos.map((video, index) => (
            <li
              key={video.slug}
              className="w-[85%] shrink-0 snap-start md:w-auto"
            >
              <ScrollReveal delayMs={(index % 2) * 60}>
                <VideoCard video={video} className="h-full" />
              </ScrollReveal>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/tours"
            className="text-body text-accent-text underline underline-offset-4 transition-colors hover:text-foreground"
          >
            All video tours
          </Link>
        </div>
      </Container>
    </Section>
  );
}
