import { cn } from "@/lib/cn";
import { standInLabel, type StandInContext } from "@/lib/media";

/**
 * The caption that marks an image as a stand-in. Sits where design system §8
 * puts the "Artist's impression" label, and disappears the moment the media
 * row's `isStandIn` flag is cleared.
 */
export function StandInLabel({
  show,
  context = "generic",
  attribution,
  /** Cards are too narrow for the qualifier — it truncated mid-word. */
  compact = false,
  className,
}: {
  show: boolean;
  context?: StandInContext;
  attribution?: string | null;
  compact?: boolean;
  className?: string;
}) {
  if (!show) return null;

  return (
    <p
      className={cn(
        "absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded-full bg-canvas/90 px-3 py-1 text-caption text-ink-secondary",
        className,
      )}
      title={attribution ?? undefined}
    >
      {compact ? "Representative image" : standInLabel(context)}
    </p>
  );
}
