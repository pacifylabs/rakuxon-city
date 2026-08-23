# Open items

Everything raised during Phases 0–5, the imagery pass and the video tour
addendum (Phase 5.5) that needs a decision, real content, or work in a later
phase. Grouped by who has to act.

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

### 1.2 Three colour tokens were darkened to meet WCAG AA

Design system §2/§10 and PRD §6 cannot both hold as written. §2 assigns these
tokens to caption-sized text; PRD §6 requires WCAG 2.1 AA and acceptance
criterion 9 wants Lighthouse accessibility ≥ 95.

| Token             | Spec      | Now       | Contrast before                 | Contrast after |
| ----------------- | --------- | --------- | ------------------------------- | -------------- |
| `ink-muted`       | `#8E948C` | `#6B716A` | 2.80 on canvas, 3.10 on surface | 4.51 / 5.01    |
| `status-sold`     | `#6B6F69` | `#686C66` | 4.42 on its own background      | 4.62           |
| `status-reserved` | `#8A6A1F` | `#87671D` | 4.40 on its own background      | 4.59           |

All three status colours were within a few hundredths of the line, which
suggests §2 was set by eye against the 4.5 threshold rather than measured. The
adjustments are two or three shades each and do not change the character of the
palette.

All three are recorded as `DEVIATION` comments at the token in
`src/app/globals.css`, with the arithmetic. Each reverts in one line.

`status-sold` carries the survey-only title ribbon, which is the one place §7
insists on stating a weak documentation position plainly — it should not be the
hardest text on the site to read.

**Needs sign-off, or a decision to revert and accept the AA failures.**

### 1.3 `Testimonial` is not in the PRD data model

PRD §5 defines no testimonial entity, but the Phase 1 seed calls for three
testimonials and Phase 3 renders a testimonials carousel from real records. The
model was added with a comment saying so (`prisma/schema.prisma`).

**Fold it into PRD §5, or remove it and hardcode the carousel.**

### 1.4 `MediaPlacement` is not in the PRD data model

PRD §5 defines no concept for page furniture — the homepage hero, the FAQ
collage, the logo and the social share image are images the site needs but no
listing owns. They were previously found by matching on a URL prefix, which
would have broken the first time an admin uploaded a replacement.

`MediaPlacement` maps a stable key (`homepage.hero`, `site.logo`,
`homepage.collage.1`, `site.ogImage`) to a `Media` row, with a label and
guidance for the admin screen. Phase 7 renders it as a list of every editable
image on the site.

**Fold it into PRD §5, or propose something else.**

### 1.5 No mapping provider has been chosen

Architecture §7 lists a `MapEmbed`; PRD §9 names no provider. Every embed worth
having needs an API key and sends the visitor's IP to a third party, which is an
NDPR question as much as a technical one.

`src/components/listings/location-block.tsx` stands in: it states the location
plainly and hands off to the visitor's own map.

**Choose a provider (and clear it against NDPR), or keep the hand-off.**

### 1.6 No seeded estate exercises FR-2.2

FR-2.2 requires an estate with no available stock to still render as portfolio
evidence. All three seeded estates currently hold available listings, so the
branch is never seen without editing data.

It is verified — the path was exercised by temporarily drafting one estate's
listings, and it renders the delivered state, the amenities and a way onward
before restoring. But a fourth seeded estate, sold out and empty, would make it
visible from day one the way the survey-only plot and the price-on-request
listings are. The plan specifies three estates, so this was not added unasked.

### 1.7 `/invest/enquire` is deliberately noindex

It scores 63 on Lighthouse SEO as a result. That is the flag doing its job on a
thin gated form, not a defect — but if the client wants the page indexed, remove
the `robots` directive in `src/app/(public)/invest/enquire/page.tsx`.

### 1.8 Default hub sort is arbitrary on seeded data

Every seeded listing shares roughly the same `publishedAt`, so "newest" ordering
is effectively random and a sold plot can lead the page. This will resolve on its
own once listings are created at different times, but it is worth deciding
whether available stock should always sort ahead of sold regardless of date.

---

### 1.9 The video tours are other people's videos — **launch gate**

The eight seeded tours are real, live YouTube videos published by other
channels, embedded at the client's explicit instruction ("make use of a public
housing video that can be updated later"). Every one renders behind a visible
_Placeholder — video by {channel}_ caption, driven by `Video.isStandIn`.

Embedding is permitted by YouTube's player terms, and each ID was checked
against the oEmbed endpoint at seed time. Two things are still true and need
closing before launch:

- **They can vanish.** The owner can delete or privatise any of them without
  notice. FR-V1.8's unavailable state handles that gracefully — verified — but a
  client demo with a dead tile is still a bad demo.
- **They are not our footage.** The caption says so, but the sooner the client's
  own drone tours replace them, the better. Clearing `isStandIn` on upload
  removes the caption, one video at a time.

**Owner: client. Replace before go-live.**

### 1.10 The posters are stand-in photographs, not video frames

06_FEATURE_VIDEO_TOURS.md §5 strongly prefers custom posters over YouTube's own
thumbnails, and it was right to: the auto-generated thumbnails on these
particular videos carry baked-in title text, arrows and price callouts
("₦1 BILLION", "THE BEST ESTATE IN LAGOS???"). Eight of those in a grid read as
someone else's marketing rather than as this site.

So each video points at a photograph from the stand-in library instead. The
consequence is that the poster does not show a frame from the video it plays.
That is why the caption reads _Placeholder_ rather than _Placeholder video_ —
it has to cover the substituted image as well as the borrowed footage.

Resolves itself when the client uploads real posters through the Phase 7 media
library.

### 1.11 The homepage video section is centred, against the design system

04_DESIGN_SYSTEM.md §4 says the section heading pairing is "never centred", and
06_FEATURE_VIDEO_TOURS.md §5 asks this section to use the standard asymmetric
pairing like every other block on the page.

The client reviewed it and asked for it centred. Built centred, flagged in
`src/components/home/video-tours.tsx` so the next reader knows it was a decision
rather than a component someone forgot to use.

**Client's call. Recorded, not disputed.**

## 1a. Needs a decision — deferred from the video addendum

### 1a.1 FR-V1.9 references structured data that does not exist

FR-V1.9 asks for `VideoObject` markup "alongside the existing
`RealEstateListing` markup". `VideoObject` is implemented. There is no
`RealEstateListing` markup anywhere on the site — no page emits structured data
of any kind, and the PRD never asked for it.

Adding it belongs to the listing pages rather than to this addendum, so it was
flagged rather than quietly built.

**Open.**

## 2. Real content required — **launch gate**

### 2.1 Trust-band figures are invented

`src/components/home/trust-band.tsx` — years operating, plots sold, estates
delivered. Every one is a placeholder marked `TODO: real figures`. PRD §8 logs
launching with invented trust figures as a **High** risk.

The delivered-estate count is the exception: it reads from the database, because
it can be true today.

### 2.2 Photography — all stand-ins, none of the actual properties

Every image on the site is now a real photograph. There are no designed
placeholder tiles left anywhere: `scripts/generate_placeholders.py` and
`public/images/placeholders/` are deleted.

**They are still stand-ins.** Twenty-two openly-licensed photographs cover land
terrain, house exteriors at each build stage, estate aerials and streets, the
hero, the FAQ collage and the article covers. Three are genuinely Nigerian
(Niger State, Kaduna, Bosso); the rest are residential photography from
elsewhere, because no open-licensed source carries Nigerian residential
exteriors — Picsum, Wikimedia and Openverse were all searched.

Every one carries `Media.isStandIn = true` and renders behind a visible
**"Representative image"** label, with the fuller _"— not the actual plot"_ on
detail pages. Clearing the flag on upload removes the label, one image at a
time, without a code change.

**Licence constraint worth knowing.** Every image is cropped to the design
system's ratios, which makes a derivative work. That rules out CC BY-ND and
CC BY-SA even though Openverse returns both under its "commercial use" filter,
so only CC BY, CC0 and Public Domain Mark are used —
`scripts/fetch_photography.py` refuses to run against anything else. Credits are
in [`IMAGE_CREDITS.md`](IMAGE_CREDITS.md) and on each `Media` row.

Design system §8 still sets the shot list the client's own photographer should
work to: wide establishing shots showing boundaries and access for land,
exterior then interiors then floor plan for homes, dated progress sequences for
estates.

**On replacement:** delete `scripts/fetch_photography.py`,
`scripts/photography-sources.json`, `public/images/photography/` and
`IMAGE_CREDITS.md`.

### 2.2b Image weight is now a live performance concern

The photographs cost real bytes where the flat tiles cost none. First build with
them dropped the homepage from 92 to **61**. Recovered to **85** by shrinking
the logo (a 2172px master was being served for a 32px-tall render, making it the
single heaviest asset on the page), trimming card crops, and dropping JPEG
quality to 72.

The homepage still ships ~620KB of imagery. Real photography will be heavier
again, so PRD §6's LCP target needs watching at the Phase 8 performance pass.

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

| Item                                                                                               | Lands in |
| -------------------------------------------------------------------------------------------------- | -------- |
| Enquiry forms submit; every "Coming soon" stub removed                                             | Phase 6  |
| Newsletter sign-up in the footer                                                                   | Phase 6  |
| Track routing (FR-3.3) with unit tests in `lib/routing`                                            | Phase 6  |
| Investor enquiry route, table and separate notification target                                     | Phase 6  |
| Turnstile, rate limiting, Resend templates                                                         | Phase 6  |
| Admin dashboard, auth, CSV importer, media upload                                                  | Phase 7  |
| Per-listing SEO metadata, OG images, `RealEstateListing` JSON-LD, sitemap                          | Phase 8  |
| Privacy policy, terms, cookie notice, NDPR consent copy and retention period                       | Phase 8  |
| Analytics with enquiry conversion **and form abandonment** (the WhatsApp risk measurement, PRD §8) | Phase 8  |
| Error boundaries, 500 page                                                                         | Phase 8  |

### 3.1 Investor lane copy review — **launch gate**

`/invest` is built and passes an automated review (`pnpm review:invest`), which
checks the rendered page for returns, yields, ROI, minimum ticket, projections,
percentages, naira figures and multiples, and confirms the page is absent from
primary navigation while linked from the footer and homepage strip.

**A human still has to read it.** The script catches mechanical failures, not
judgement. Re-run it against the deployment before launch.

Architecture §10 also asks that the advice be **put to the client in writing**,
so there is a record if they later ask for projected returns. That has not been
done — it is not something the codebase can do.

### 3.2 Routes that still 404

`/privacy` and `/terms` — Phase 8. They are linked from the footer and land on
the styled 404 in `src/app/not-found.tsx` until the legal copy exists.

Every other public route is now built.

---

### 3.3 Video admin is Phase 7

06_FEATURE_VIDEO_TOURS.md §8 defers all of it: the paste-any-URL form with ID
extraction, poster upload through the media library, the featured toggle and
drag-to-reorder, and an oEmbed validity check on save that warns when a video
has gone private. None of it is built. Videos arrive through `prisma/seed.ts`
until then.

## 4. Engineering follow-ups

### 4.1 `NEXT_PUBLIC_SITE_URL` must be set before deploying

Absolute URLs in metadata — `og:image` above all — are built from it. Unset, it
falls back to `http://localhost:3000` and every shared link points at nothing.
Set it to the real origin in the deployment environment.

### 4.2 Database is optional, and the fallback needs keeping in step

The public site runs with no DATABASE_URL, serving `src/data/snapshot.json`.
Docker and Postgres are only needed to work on the schema or the seed.

**The cost:** two read paths. `src/lib/data/fixture.ts` mirrors the Prisma
queries, and two implementations of the same filtering rules is exactly the
shape of thing that drifts. `pnpm verify:parity` runs 23 checks across both and
already caught one real bug — `?page=5` on a one-page result returned an empty
grid from Postgres, rendering "nothing matches your filters" over a result set
that was not empty.

Run `pnpm snapshot` after any seed change, and `pnpm verify:parity` in CI.

**Phase 7 changes this.** Once staff write data, a snapshot cannot be the live
source, and DATABASE_URL becomes genuinely required for the admin routes. The
public read paths can keep the fallback for previews.

### 4.2b The local Docker container

`docker-compose.yml` runs `postgres:17-alpine` on port 55432. The schema and seed
are portable — moving to Neon or Supabase is a one-line `DATABASE_URL` change —
but a hosted database is needed before anything is deployed.

Note that the homepage and both detail routes are prerendered at build time, so
the build itself needs database access.

### 4.3 Passwords use `node:crypto` scrypt

The seed hashes with scrypt rather than bcrypt or argon2, because Phase 0 said to
install nothing for auth yet. The stored format is self-describing
(`scrypt$N$r$p$salt$hash`) so Phase 7 can verify these or re-hash on first login.

Seeded credentials are `ChangeMeBeforeLaunch1/2/3` — **must not survive Phase 7.**

### 4.4 `/primitives` is internal

`src/app/(public)/primitives/page.tsx` carries `noindex` and exists to verify the
design system. Delete it at the Phase 8 launch gate.

### 4.5 Prisma vendored agent skills

`prisma init` installed nine skill directories into `.agents/skills` with
symlinks in `.claude/skills`. Both are git-ignored; `skills-lock.json` pins them
and `npx skills add prisma/skills` restores them.

### 4.7 Database latency dominates every dynamic page — **launch gate**

Measured on the production build, warm, three runs each, against the configured
Neon instance in `us-east-2` from a machine in Nigeria:

| Route        | With Neon          | Same build, no database |
| ------------ | ------------------ | ----------------------- |
| `/land`      | 1,020–1,200 ms     | 12–18 ms                |
| `/homes`     | 1,018–1,057 ms     | 13–15 ms                |
| `/tours`     | 778–815 ms         | 10–15 ms                |
| `/resources` | 520–536 ms         | 9–13 ms                 |
| `/`          | 4 ms (prerendered) | 4 ms                    |

Roughly seventy times slower, on identical code. This is not rendering cost —
it is the round trip. Each hub makes two queries, and each query crosses the
Atlantic twice.

`getListingPage` and `getVideoPage` now issue the count and the page in
parallel instead of one after the other, which removed one trip and took
`/tours` from ~800 ms to ~540 ms. The rest is physics, and the fix is
deployment rather than code:

1. **Host the app in the same region as the database.** Then app→database is
   about a millisecond and only the visitor→app hop is long, which a CDN
   absorbs. This is the real fix.
2. Or move the database to a region near the users.
3. Locally, unset `DATABASE_URL` — the bundled snapshot serves the same pages in
   double-digit milliseconds.

Note also that Neon's compute suspends when idle; the first request after a
sleep can exceed Prisma's connect timeout and fail outright with `P1001`.

### 4.8 The dev server is slow on first visit to each route

Turbopack compiles a route the first time it is requested — measured at 6.6 s
for a cold homepage, then 0.7–1.7 s warm. That is dev-mode behaviour and says
nothing about production, where the same homepage is prerendered and serves in
4 ms. Worth knowing before optimising something that is not slow.

### 4.9 `scripts/fetch_photography.py` no longer refetches by default

Adding one source used to re-download all twenty-five, which Wikimedia answers
with an HTTP 429 whose body is an HTML error page. PIL then failed to open it
several images later, which read as a corrupt image rather than as rate
limiting. Existing files are now skipped, the response is checked for an image
signature before decoding, and `--refetch` forces a full rebuild.

### 4.10 Free-licence photography sources are exhausted

Four sources have now been worked through across two sessions: Picsum (no
houses), Openverse (behind a Cloudflare challenge, returns 429), Wikimedia text
search (almost entirely archival black-and-white survey photography, and
geograph.org.uk floods it with CC BY-SA, which a cropped derivative cannot use)
and Wikimedia categories (genuinely Nigerian, but mostly meetup photos and
mud-brick villages).

That yielded three more usable Nigerian land photographs, bringing the library
to twenty-five: six land, eight homes, three estates, four articles and four
site slots. With twenty-three plots on the hub, each land photograph now appears
roughly four times.

A **Pexels or Unsplash API key** would resolve this in minutes — both licences
permit commercial use and modification with no attribution requirement, and
`scripts/photography-sources.json` already has the shape to take them. Requested
twice; not yet supplied.

### 4.6 Do not run Prettier over `docs/`

`docs` is in `.prettierignore`. The five specification documents are the
client's; Prettier reflows their markdown tables and swaps emphasis markers,
which produces noisy diffs on files we do not own.
