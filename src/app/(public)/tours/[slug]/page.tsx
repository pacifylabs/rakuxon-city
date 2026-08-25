import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { VideoFacade } from "@/components/video/video-facade";
import { getVideoDetail, getVideoSlugs } from "@/lib/videos";
import { formatDuration, posterUrl, videoKindLabels } from "@/lib/video";
import { BackLink } from "@/components/layout/back-link";
import { absoluteUrl, origin } from "@/lib/seo";
import { VideoStructuredData } from "@/components/video/video-structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/schema";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getVideoSlugs()).map((slug) => ({ slug }));
}

/**
 * FR-V1.5 / AC6 — these pages exist to be pasted into WhatsApp and Instagram,
 * so the Open Graph tags are the feature, not decoration. The poster is the
 * share image; without it the link previews as a bare URL and nobody taps it.
 */
export async function generateMetadata({
  params,
}: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const video = await getVideoDetail((await params).slug);
  if (!video) return {};

  const title = `${video.title} — Rakuxon City`;
  const description =
    video.description ??
    `A ${videoKindLabels[video.kind].toLowerCase()} of ${video.parent?.name ?? "one of our developments"}.`;
  const image = video.poster?.url ?? posterUrl(video.youtubeId);

  return {
    title,
    description,
    // FR-V1.6 — these pages exist to be shared, so the canonical matters more
    // here than anywhere. `video.other` is kept rather than going through
    // pageMetadata, which only emits `website`.
    alternates: { canonical: absoluteUrl(`/tours/${video.slug}`) },
    openGraph: {
      title: video.title,
      description,
      type: "video.other",
      images: [{ url: image, alt: video.poster?.alt ?? video.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description,
      images: [image],
    },
  };
}

export default async function TourPage({ params }: PageProps<"/tours/[slug]">) {
  const video = await getVideoDetail((await params).slug);
  if (!video) notFound();

  const duration = formatDuration(video.durationSeconds);

  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        {/*
          FR-V1.9. These pages exist to be shared, so the video markup matters
          more here than on a listing — it is what produces a video result
          rather than a plain link. Breadcrumbs too, since the visible trail was
          removed at the client's request (TODO §1.14).
        */}
        <VideoStructuredData videos={[video]} siteUrl={origin()} />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Video tours", path: "/tours" },
            { name: video.title, path: `/tours/${video.slug}` },
          ])}
        />

        <BackLink href="/tours" label="All video tours" />

        <div className="mx-auto max-w-4xl">
          {/* FR-V1.5 — full width, and still a facade: a shared link that
              costs a megabyte before playing is a link that does not open. */}
          <VideoFacade video={video} priority>
            <Badge className="pointer-events-none absolute top-3 left-3 bg-accent-tint text-accent-text">
              {videoKindLabels[video.kind]}
            </Badge>
            {duration ? (
              <span className="tabular pointer-events-none absolute right-3 bottom-3 rounded-full bg-charcoal-deep/70 px-2.5 py-1 text-caption text-ivory-light">
                {duration}
              </span>
            ) : null}
          </VideoFacade>

          <h1 className="mt-8 text-display-m text-foreground">{video.title}</h1>

          {video.context ? (
            <p className="mt-3 text-body text-muted">{video.context}</p>
          ) : null}

          {video.description ? (
            <p className="mt-6 max-w-[62ch] text-body-l text-muted">
              {video.description}
            </p>
          ) : null}

          {video.parent ? (
            <div className="mt-10 rounded-card border border-line bg-surface p-6 lg:p-8">
              <p className="text-caption text-muted">
                This tour belongs to
              </p>
              <p className="mt-2 text-heading text-foreground">{video.parent.name}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <ButtonLink href={video.parent.href}>
                  View the listing
                </ButtonLink>
                <Link
                  href="/contact"
                  className="text-body text-accent-text underline underline-offset-4 hover:text-foreground"
                >
                  Ask about it
                </Link>
              </div>
            </div>
          ) : null}

          <p className="mt-10">
            <Link
              href="/tours"
              className="text-body text-accent-text underline underline-offset-4 hover:text-foreground"
            >
              All video tours
            </Link>
          </p>
        </div>
      </Container>
    </Section>
  );
}
