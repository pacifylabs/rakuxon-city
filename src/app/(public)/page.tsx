/**
 * Phase 0 placeholder. Exists to prove the canvas background and both
 * typefaces render; replaced by the real homepage in Phase 6.
 */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-24 lg:px-16">
      <p className="text-eyebrow text-ink-muted">Phase 0 — project setup</p>
      <h1 className="mt-6 max-w-[16ch] text-display-xl">
        Rakuxon City is wired up.
      </h1>
      <p className="mt-8 max-w-[52ch] text-body text-ink-secondary">
        This heading is Instrument Sans at regular weight. This paragraph is
        Inter. The page sits on canvas, not white. Nothing below the design
        system has been built yet.
      </p>
    </main>
  );
}
