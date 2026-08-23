/** The key facts panel on a detail page. Figures set in tabular numerals (§3). */
export function FactList({
  facts,
}: {
  facts: { label: string; value: string; tabular?: boolean }[];
}) {
  return (
    <ul className="grid divide-y divide-hairline border-y border-hairline sm:grid-cols-2 sm:divide-y-0">
      {facts.map((fact) => (
        <li key={fact.label} className="py-4 sm:py-5">
          <p className="text-caption text-ink-muted">{fact.label}</p>
          <p
            className={`mt-1 text-body text-ink ${fact.tabular ? "tabular" : ""}`}
          >
            {fact.value}
          </p>
        </li>
      ))}
    </ul>
  );
}
