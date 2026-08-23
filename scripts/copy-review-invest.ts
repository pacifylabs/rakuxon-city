/**
 * Automated copy review for the investor lane — FR-4.1, FR-4.2 and PRD §8.
 *
 * Publishing returns, yields, ROI figures, minimum ticket sizes or profit
 * projections on /invest turns the page into a financial promotion and pulls
 * the client into SEC territory. PRD §8 logs that as a High risk and makes copy
 * review a launch gate.
 *
 * A human still has to read the page. This catches the mechanical failures — a
 * percentage that crept into a paragraph, the word "guaranteed", a naira figure
 * next to the word "from" — so review time goes on judgement rather than on
 * grepping.
 *
 *   pnpm review:invest            # against localhost:3100
 *   pnpm review:invest https://…  # against a deployment
 */

const base = process.argv[2] ?? "http://localhost:3100";

/** Words that have no business on a descriptive credibility page. */
const forbiddenTerms = [
  "return on investment",
  "returns",
  "yield",
  "roi",
  "profit",
  "guaranteed",
  "guarantee",
  "minimum investment",
  "minimum ticket",
  "per annum",
  "p.a.",
  "interest rate",
  "payout",
  "dividend",
  "projection",
  "projected",
  "irr",
  "capital gain",
  "appreciation",
];

/** Figures that read as an offer: percentages, and money next to entry language. */
const forbiddenPatterns: { label: string; pattern: RegExp }[] = [
  { label: "a percentage", pattern: /\b\d+(\.\d+)?\s?%/ },
  { label: "a naira figure", pattern: /₦\s?[\d,]+/ },
  { label: "a multiple (e.g. 2x)", pattern: /\b\d+(\.\d+)?x\b/i },
  {
    label: "money-per-period phrasing",
    pattern: /\b(per year|annually|monthly return)\b/i,
  },
];

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ");
}

async function main() {
  const failures: string[] = [];

  const investHtml = await fetch(`${base}/invest`).then((r) => r.text());
  const text = visibleText(investHtml);
  const lower = text.toLowerCase();

  console.log(`Copy review — ${base}/invest\n`);

  for (const term of forbiddenTerms) {
    if (lower.includes(term)) {
      failures.push(`forbidden term: "${term}"`);
      console.log(`  FAIL  contains "${term}"`);
    }
  }

  for (const { label, pattern } of forbiddenPatterns) {
    const match = text.match(pattern);
    if (match) {
      failures.push(`${label}: "${match[0].trim()}"`);
      console.log(`  FAIL  publishes ${label} — "${match[0].trim()}"`);
    }
  }

  if (failures.length === 0) {
    console.log(
      "  PASS  no returns, yields, ROI, minimum ticket or projections",
    );
    console.log("  PASS  no percentages, naira figures or multiples");
  }

  // FR-4.1 — reachable from the footer and the homepage strip only.
  const homeHtml = await fetch(`${base}/`).then((r) => r.text());
  const primaryNav =
    homeHtml.match(/aria-label="Primary"[\s\S]*?<\/nav>/)?.[0] ?? "";
  const inPrimaryNav = primaryNav.includes('href="/invest"');
  const inFooter = /aria-label="Footer"[\s\S]*?href="\/invest"/.test(homeHtml);
  const inHomepageStrip = homeHtml.includes('href="/invest"');

  console.log();
  console.log(
    `  ${inPrimaryNav ? "FAIL" : "PASS"}  absent from primary navigation`,
  );
  console.log(`  ${inFooter ? "PASS" : "FAIL"}  linked from the footer`);
  console.log(
    `  ${inHomepageStrip ? "PASS" : "FAIL"}  linked from the homepage strip`,
  );

  if (inPrimaryNav) failures.push("/invest appears in primary navigation");
  if (!inFooter) failures.push("/invest is not linked from the footer");
  if (!inHomepageStrip)
    failures.push("/invest is not linked from the homepage");

  console.log();
  if (failures.length > 0) {
    console.log(
      `${failures.length} failure(s). This is a launch gate — fix before shipping.`,
    );
    process.exit(1);
  }
  console.log("Copy review passed. A human should still read the page.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
