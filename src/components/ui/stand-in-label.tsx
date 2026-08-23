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
  className,
}: {
  show: boolean;
  context?: StandInContext;
  attribution?: string | null;
  className?: string;
}) {
  if (!show) return null;

  return (
    <p
      className={cn(
        "text-caption text-ink-secondary bg-canvas/90 absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full px-3 py-1",
        className,
      )}
      title={attribution ?? undefined}
    >
      {standInLabel(context)}
    </p>
  );
}
