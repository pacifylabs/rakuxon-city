import { serialiseJsonLd } from "@/lib/seo";

/**
 * Renders one JSON-LD block.
 *
 * A server component, so the markup is in the HTML a crawler receives rather
 * than injected after hydration. `serialiseJsonLd` escapes `<`, which is the
 * only character that could close the script tag early.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialiseJsonLd(data) }}
    />
  );
}
