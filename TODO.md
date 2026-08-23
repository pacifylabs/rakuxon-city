# Open items

Everything raised during Phases 0–4 that needs a decision, real content, or work
in a later phase. Grouped by who has to act.

Phase numbers refer to `docs/03_implementation_plan.md` (v3.0). Items marked
**launch gate** must be closed before go-live — PRD §7 acceptance criteria and
the Phase 8 content gate both depend on them.

---

## 1. Needs a decision from the client or the design owner

### 1.1 The logo conflicts with the palette

`docs/public/logo.png` (copied to `public/logo.png`) is navy and gold. Design
system §11 says "no second accent colour. Sage carries everything."

Currently used as-is in the header, on the reasoning that a brand mark is
allowed its own colours. The alternatives are a monochrome `ink` version in the
header keeping the colour version for the footer, or a full re-draw in sage.

**Open. Header treatment only — nothing else depends on it.**

### 1.2 Two colour tokens were darkened to meet WCAG AA

Design system §2/§10 and PRD §6 cannot both hold as written. §2 assigns these
tokens to caption-sized text; PRD §6 requires WCAG 2.1 AA and acceptance
criterion 9 wants Lighthouse accessibility ≥ 95.

| Token | Spec | Now | Contrast before | Contrast after |
|---|---|---|---|---|
| `ink-muted` | `#8E948C` | `#6B716A` | 2.80 on canvas, 3.10 on surface | 4.51 / 5.01 |
| `status-sold` | `#6B6F69` | `#686C66` | 4.42 on its own background | 4.62 |

Both are recorded as `DEVIATION` comments at the token in
`src/app/globals.css`, with the arithmetic. Each reverts in one line.

`status-sold` carries the survey-only title ribbon, which is the one place §7
insists on stating a weak documentation position plainly — it should not be the
hardest text on the site to read.

**Needs sign-off, or a decision to revert and accept the AA failure.**

### 1.3 `Testimonial` is not in the PRD data model

PRD §5 defines no testimonial entity, but the Phase 1 seed calls for three
testimonials and Phase 3 renders a testimonials carousel from real records. The
model was added with a comment saying so (`prisma/schema.prisma`).

**Fold it into PRD §5, or remove it and hardcode the carousel.**

### 1.4 No mapping provider has been chosen

Architecture §7 lists a `MapEmbed`; PRD §9 names no provider. Every embed worth
having needs an API key and sends the visitor's IP to a third party, which is an
NDPR question as much as a technical one.

`src/components/listings/location-block.tsx` stands in: it states the location
plainly and hands off to the visitor's own map.

**Choose a provider (and clear it against NDPR), or keep the hand-off.**

### 1.5 Default hub sort is arbitrary on seeded data

Every seeded listing shares roughly the same `publishedAt`, so "newest" ordering
is effectively random and a sold plot can lead the page. This will resolve on its
own once listings are created at different times, but it is worth deciding
whether available stock should always sort ahead of sold regardless of date.

---

## 2. Real content required — **launch gate**

### 2.1 Trust-band figures are invented

`src/components/home/trust-band.tsx` — years operating, plots sold, estates
delivered. Every one is a placeholder marked `TODO: real figures`. PRD §8 logs
launching with invented trust figures as a **High** risk.

The delivered-estate count is the exception: it reads from the database, because
it can be true today.

### 2.2 Photography

All 31 images are generated placeholders (`public/images/placeholders/`), each
captioned "Photography pending" in the UI. Design system §8 sets the shot list:
wide establishing shots showing boundaries and access for land, exterior first
then interiors then floor plan for homes, dated progress sequences for estates.

The `alt` text on every seeded `Media` row already describes the intended shot,
so it doubles as a brief.

**On replacement:** delete `scripts/generate_placeholders.py` and
`src/lib/media.ts`, and remove the "Photography pending" captions.

### 2.3 Contact details

`src/components/layout/footer.tsx` — `+234 800 000 0000`,
`hello@rakuxoncity.com`, and the `land@` / `homes@` addresses on the homepage
enquiry band are all placeholders.

### 2.4 Article bodies

The four seeded articles carry a real title, category and excerpt, but the body
is `"Full article copy pending client sign-off."` The excerpt is what the
homepage teaser renders, so the homepage looks complete and
`/resources/[slug]` will not.

### 2.5 Testimonial photographs

No avatars are seeded. Design system §11 permits real buyer photographs only, so
the component falls back to initials rather than using stock faces. Real
photographs need the buyers' permission alongside the quotes.

### 2.6 Floor plans

None seeded. House detail pages show "The floor plan for this unit is available
on request" where the drawing would go.

### 2.7 Per-listing title sign-off

PRD §8 logs inaccurate documentation on a listing as a **High** risk, mitigated
by client sign-off per listing at publish. None of the seeded listings have been
signed off — they are invented for the demo and must not be published as-is.

---

## 3. Deferred to a later phase by design

| Item | Lands in |
|---|---|
| Enquiry forms submit; every "Coming soon" stub removed | Phase 6 |
| Newsletter sign-up in the footer | Phase 6 |
| Track routing (FR-3.3) with unit tests in `lib/routing` | Phase 6 |
| Investor enquiry route, table and separate notification target | Phase 6 |
| Turnstile, rate limiting, Resend templates | Phase 6 |
| Admin dashboard, auth, CSV importer, media upload | Phase 7 |
| Per-listing SEO metadata, OG images, `RealEstateListing` JSON-LD, sitemap | Phase 8 |
| Privacy policy, terms, cookie notice, NDPR consent copy and retention period | Phase 8 |
| Analytics with enquiry conversion **and form abandonment** (the WhatsApp risk measurement, PRD §8) | Phase 8 |
| Error boundaries, 500 page | Phase 8 |

### 3.1 Investor lane copy review — **launch gate**

`/invest` is not built yet (Phase 5). When it is, PRD §8 and FR-4.2 make copy
review a launch gate: no returns, yields, ROI figures, minimum ticket sizes or
profit projections. Publishing any of them turns the page into a financial
promotion and pulls the client into SEC territory.

Architecture §10 also asks that the advice be **put to the client in writing**,
so there is a record if they later ask for projected returns.

### 3.2 Routes that still 404

`/estates`, `/estates/[slug]`, `/about`, `/contact`, `/resources`,
`/resources/[slug]`, `/invest`, `/invest/enquire`, `/privacy`, `/terms` — all
Phase 5 or Phase 8. They are linked from the header, the footer and the listing
detail pages, and currently land on the styled 404 in `src/app/not-found.tsx`.

---

## 4. Engineering follow-ups

### 4.1 Database is a local Docker container

`docker-compose.yml` runs `postgres:17-alpine` on port 55432. The schema and seed
are portable — moving to Neon or Supabase is a one-line `DATABASE_URL` change —
but a hosted database is needed before anything is deployed.

Note that the homepage and both detail routes are prerendered at build time, so
the build itself needs database access.

### 4.2 Passwords use `node:crypto` scrypt

The seed hashes with scrypt rather than bcrypt or argon2, because Phase 0 said to
install nothing for auth yet. The stored format is self-describing
(`scrypt$N$r$p$salt$hash`) so Phase 7 can verify these or re-hash on first login.

Seeded credentials are `ChangeMeBeforeLaunch1/2/3` — **must not survive Phase 7.**

### 4.3 `/primitives` is internal

`src/app/(public)/primitives/page.tsx` carries `noindex` and exists to verify the
design system. Delete it at the Phase 8 launch gate.

### 4.4 Prisma vendored agent skills

`prisma init` installed nine skill directories into `.agents/skills` with
symlinks in `.claude/skills`. Both are git-ignored; `skills-lock.json` pins them
and `npx skills add prisma/skills` restores them.

### 4.5 Do not run Prettier over `docs/`

`docs` is in `.prettierignore`. The five specification documents are the
client's; Prettier reflows their markdown tables and swaps emphasis markers,
which produces noisy diffs on files we do not own.
