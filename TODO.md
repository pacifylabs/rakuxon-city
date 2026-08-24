# Open items

Everything raised during Phases 0–5, the imagery pass and the video tour
addendum (Phase 5.5) that needs a decision, real content, or work in a later
phase. Grouped by who has to act.

Phase numbers refer to `docs/03_implementation_plan.md` (v3.0). Items marked
**launch gate** must be closed before go-live — PRD §7 acceptance criteria and
the Phase 8 content gate both depend on them.

---

## 1. Needs a decision from the client or the design owner

### 1.1 The palette is now the logo's — **needs design-owner sign-off**

`public/logo.png` is navy and gold. Design system §11 says "no second accent
colour. Sage carries everything." The client resolved it by instruction, in two
steps: gold first as a restrained secondary, then — on review — **gold as the
action colour and navy as the ground, with sage retired entirely.**

Both values are sampled from the mark: gold `#C4933C` (hue 38.4°), navy
`#0E254E`.

Gold as an action colour has one trap, and it is why there are three tokens:

| Token                 | Value     | On canvas | On surface | On navy | Permitted use                                                    |
| --------------------- | --------- | --------- | ---------- | ------- | ---------------------------------------------------------------- |
| `--color-accent`      | `#806028` | 5.23      | 5.80       | —       | Text and borders on light grounds                                |
| `--color-accent-fill` | `#C4933C` | 2.50      | —          | 5.44    | A **ground** under navy text; text on navy. Never text on canvas |
| `--color-accent-tint` | `#F7ECD7` | —         | —          | —       | Pale wash; carries `--color-accent` text at 4.95                 |

A gold light enough to read as gold is far too light to be text on a near-white
canvas — `#C4933C` is 2.50 there. So filled buttons carry **navy** text, not
white: white on `#C4933C` is 2.77 and fails outright. If a gold control ever
looks wrong, check for white text on it first.

Navy replacing the old near-black ground had a consequence worth recording:
navy's luminance is 0.0197 against `#101310`'s 0.0061, so a scrim over a
photograph needs **more** opacity, not less — 70% to hold body text at AA, 65%
fails at 4.44. At 70% navy the photograph underneath was no longer visible. The
hero was restructured rather than tuned: copy sits on solid navy, the
photograph occupies its own column at full strength. See the note in
`src/components/home/hero.tsx`.

Status colours are untouched. §2 defines them as a separate semantic axis, and
green still means available.

Verified: Lighthouse accessibility 100 and zero contrast failures on `/`,
`/land` and `/contact` after the change.

**Still a documented deviation from §11 and §2. §11 should be amended rather
than left contradicting the build.**

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

### 1.12 Breadcrumbs removed from every detail page

01_SITE_ARCHITECTURE.md §7 lists `BreadcrumbNav` as a component on "All detail
pages". At the client's instruction it has been removed everywhere and replaced
by an active-state indicator on the primary navigation — an accent rule under
the current section, plus `aria-current="page"`, matched by path prefix so
`/land/emerald-ridge-plot-a14` lights "Land".

`src/components/listings/breadcrumbs.tsx` is deleted rather than left unused.

What was traded away, so it is on the record rather than discovered later:

- A detail page no longer shows its own position in the hierarchy, only its
  section. "Home / Land / Plot A14" becomes an underline under "Land".
- The one-tap route back to the parent hub or estate is gone. Visitors arriving
  from search or a shared WhatsApp link now use the nav or the back button.
- `/tours` and `/contact` are not in primary navigation, so pages under them
  light nothing at all.

**Client's call, made after seeing the built page. Reversible — the component
was a single file and the six call sites were one line each.**

### 1.14 Autoplay on the homepage spotlight, against §9

Design system §9 says "a 300ms slide, no autoplay". The client asked for the
homepage product row to advance on its own.

Built as an opt-in prop rather than a default, so §9 still holds everywhere
else — `/primitives` and any future carousel are unaffected. The one autoplaying
instance carries what WCAG 2.2.2 requires of moving content:

- a visible pause control
- it never starts under `prefers-reduced-motion: reduce`
- it pauses on hover, on keyboard focus, and while the tab is hidden
- it stops permanently on the first deliberate interaction

**Open — §9 should be amended to describe the exception, or the exception
withdrawn.**

### 1.15 The "Representative image" label was removed — **licence dependency**

Every listing, estate and article photograph used to carry a visible
"Representative image" chip, with the CC BY credit in its tooltip. The client
asked for it removed everywhere.

Removed, and the attribution moved to `/credits`, linked from the footer. That
matters legally, not cosmetically: **22 of the 25 photographs are CC BY**, which
requires attribution "in a manner reasonable to the medium". A credits page is
the conventional answer for a website; removing the chip with nothing replacing
it would have put the site outside the licence on those 22 images.

Two consequences to be aware of:

- **`/credits` cannot be deleted** while stand-in photography is in use. It
  reads `public/images/photography/manifest.json` directly, so it stays correct
  as images are swapped, and empties itself when none remain.
- Nothing on a listing page now tells a visitor the photograph is not the actual
  plot. The site states a survey number and a title type beside it, so a buyer
  has every reason to read the image as the property. This is a stronger reason
  than usual to close §2.5 before launch.

**Resolved as instructed. The launch gate at §2.2 is now load-bearing.**

### 1.16 The photographic hero costs LCP — **breaches PRD §6**

The client chose to anchor the hero on a full-width photograph. That moved the
homepage LCP element from a text node to an image, and the cost is measured:

|                                      | Text hero | Photographic hero |
| ------------------------------------ | --------- | ----------------- |
| Mobile performance (median of 3)     | 94        | 89                |
| LCP                                  | ~2s       | 3.5–4.0s          |
| Accessibility / best practices / SEO | 100       | 100               |
| CLS                                  | 0         | 0                 |

**PRD §6 requires LCP under 2.5s on a mid-range Android over 3G.** The homepage
no longer meets it.

What was already done, and what it bought:

- The below-fold estate image still carried `priority` from when it was the LCP.
  It was preloading 85KB — the page's largest payload — ahead of the real LCP
  image. Removed.
- AVIF enabled ahead of WebP, hero `sizes` corrected to the real rendered width,
  quality 68. Hero went from 74KB to 27KB, a 64% cut.
- Optimised variants now cached for a year rather than re-encoded per cold hit.

None of it moved LCP much, and the reason is worth recording so nobody repeats
the work: the hero transfers in **13ms** on the real connection. The 3.8s is
Lighthouse's _simulated_ slow-4G, where LCP is dominated by ~2s of Load Delay —
discovery and queueing behind 508KB of total page weight — not by the image's
size. Shrinking it further will not help. A font-preload experiment (dropping
Inter's preload) was measured and made no difference either; that hypothesis is
disproved, do not retry it.

The levers that would actually work:

1. **Revert to the text hero.** Recovers ~10 points immediately, undoes the
   client's explicit choice.
2. **Reduce total page weight.** 160KB of scripts is the next largest block
   after images.
3. **Accept it and amend PRD §6.** Defensible if the client values the hero more
   than the target — but it should be an explicit decision, not a silent drift.

A later change made the hero a three-slide carousel of estates. That cost
nothing measurable, because only the first slide is eager — the page still
fetches four images totalling 115KB, exactly as it did with one static hero.
The same rule must hold for anything added there.

The client also asked for a moving video background. It was not built: a looping
MP4 runs 2–5MB and would have made this page unusable on the device it targets.
The motion is a CSS transform on the image already downloaded — zero extra
bytes. That trade was explicit and agreed.

**Open. Needs the client's call, since they chose the photographic hero knowing
it cost an LCP image.**

### 1.13 Which two filters lead each hub is a guess

The filter row is now two tiers: two chips inline, the rest behind "More
filters". Land leads with title type and price, homes with bedrooms and price.

Title type leads land because §7 makes it the signature element, and price is
the near-universal first filter. Both are reasoning, not evidence. Once there
is analytics on the live site, the pair should be whichever two are actually
used — it is a one-line `primary: true` change per filter in
`src/app/(public)/land/page.tsx` and `homes/page.tsx`.

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

### 1.17 Rate limiting is per-instance

`src/lib/rate-limit.ts` holds its windows in process memory. On a platform that
runs several serverless instances, an attacker gets the limit multiplied by the
number of instances they happen to hit.

It still does the job it is there for — stopping a script hammering one
endpoint, and a frustrated visitor pressing send eleven times. Turnstile is
what stands between the site and a determined attacker.

Phase 7 introduces Redis for job queues. Moving this to a shared store then is
a small change.

### 1.18 Round-robin distribution is proven by unit test, not end to end

`selectAssignee` spreads work across every eligible user on a track, and
`src/lib/routing.test.ts` covers that with 14 tests including the distribution
case.

**The live path cannot demonstrate it.** The seed has exactly one land-track
user and one homes-track user, per Phase 1 of the implementation plan, so every
land enquiry correctly goes to the same person whatever the algorithm does. The
end-to-end check therefore proves *correct routing* — land never reaches the
homes desk — but not *distribution*.

Seeding a second sales user per track would make it demonstrable, and would
deviate from the Phase 1 spec. Worth raising with the client rather than doing
silently.

### 2.1 Contact details — partly real, one unverified

`src/lib/site.ts` now holds every contact detail, taken from the sibling
`rakuxon-care` project, which had already separated group-level facts from
brand-specific ones.

**Real and carried across:** the Rakuxon group social accounts (Instagram,
Facebook, X, TikTok, YouTube) and the Nigerian WhatsApp line
**+234 816 717 8847**, which replaces `+234 800 000 0000` — a placeholder that
was sitting in a `tel:` link on every page and is not a dialable number.

**Deliberately NOT carried across:** `hello@rakuxoncare.co.uk`, the CQC status,
the Employment Agencies regulations and "Rakuxon Care Ltd". Those belong to a
UK home-care business; a Lagos buyer enquiring about a plot must not be routed
to any of them.

**Still unverified — needed before launch:**

- `hello@rakuxoncity.com`. Conventional for the domain but not published
  anywhere, and it is the address every enquiry mailto now points at. Confirm
  the mailbox exists and is monitored.
- Registered company name and RC number. Needed by the terms of use, first
  section. Not published on rakuxon.com and not in the care project.
- A Nigerian office address. rakuxon.com's London address belongs to the UK
  businesses. Omitted rather than invented, which is also why the
  `RealEstateAgent` schema carries `areaServed` and no `PostalAddress`.
- Whether the group phone should be presented as the property line at all, or
  whether a dedicated Rakuxon City number should be obtained first.

### 2.2 Privacy notice and terms are unreviewed — **legal sign-off required**

`/privacy` and `/terms` are written and live, describing what the site actually
does rather than boilerplate. Both carry a visible "Awaiting sign-off" banner.

Under the Nigeria Data Protection Act 2023 an inaccurate privacy notice is a
compliance problem, not an editorial one. Two statements in it are placeholders
that must be replaced with decisions, not with wording:

- **Retention period.** The notice says the exact period "is being confirmed".
  A figure is needed.
- **Analytics.** The notice states that none runs, which is true today. If any
  is added, that section must be rewritten _before_ it ships, and a consent
  banner is likely required.

The terms need the registered company name and RC number above.

### 2.3 Buyer-guide copy is unreviewed — **legal sign-off required**

`prisma/article-bodies.ts` carries full body copy for all twelve guides,
written at the client's instruction to replace the placeholder line that left
those pages visibly empty. Roughly 3,000 characters each, against ~200 before.

**No lawyer has read it.** It describes the Land Use Act 1978, Certificates of
Occupancy, Governor's consent under s.22, excision, gazette, charting at the
Surveyor-General's office, and ordinary payment-plan practice. It was written
carefully and it is not legal advice.

This matters more here than it would on most sites. The whole position of
Rakuxon City is that it tells buyers the truth about documentation — including
where its own title is weak. Publishing anything inaccurate in a guide costs
more credibility than an empty page would have.

**Before launch:** the client's solicitor reads all twelve and either signs off
or replaces them. The file is deliberately separate from `seed.ts` so it can be
handed to a reviewer on its own.

### 2.4 Trust-band figures are invented

`src/components/home/trust-band.tsx` — years operating, plots sold, estates
delivered. Every one is a placeholder marked `TODO: real figures`. PRD §8 logs
launching with invented trust figures as a **High** risk.

The delivered-estate count is the exception: it reads from the database, because
it can be true today.

### 2.5 Photography — all stand-ins, none of the actual properties

Every image on the site is now a real photograph. There are no designed
placeholder tiles left anywhere: `scripts/generate_placeholders.py` and
`public/images/placeholders/` are deleted.

**They are still stand-ins.** Twenty-two openly-licensed photographs cover land
terrain, house exteriors at each build stage, estate aerials and streets, the
hero, the FAQ collage and the article covers. Three are genuinely Nigerian
(Niger State, Kaduna, Bosso); the rest are residential photography from
elsewhere, because no open-licensed source carries Nigerian residential
exteriors — Picsum, Wikimedia and Openverse were all searched.

Every one carries `Media.isStandIn = true`, which is what the admin will filter
on in Phase 7 to find the images still needing replacement.

**The on-image "Representative image" label has been removed** at the client's
instruction. Attribution moved to `/credits`, linked from the footer and built
from the photography manifest, which is how CC BY expects a website to credit —
removing the label with nothing replacing it would have put 22 images outside
their licence.

The honesty cost is real and is worth stating plainly: a visitor now sees a
photograph of a house in Hawaii above a listing that states a survey number and
a title type, with nothing on the page saying it is not that plot. That is
acceptable for a preview and is not acceptable at launch, which makes replacing
this photography a harder gate than it was, not a softer one.

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

### 2.6 Image weight is now a live performance concern

The photographs cost real bytes where the flat tiles cost none. First build with
them dropped the homepage from 92 to **61**. Recovered to **85** by shrinking
the logo (a 2172px master was being served for a 32px-tall render, making it the
single heaviest asset on the page), trimming card crops, and dropping JPEG
quality to 72.

The homepage still ships ~620KB of imagery. Real photography will be heavier
again, so PRD §6's LCP target needs watching at the Phase 8 performance pass.

### 2.7 Testimonial photographs

No avatars are seeded. Design system §11 permits real buyer photographs only, so
the component falls back to initials rather than using stock faces. Real
photographs need the buyers' permission alongside the quotes.

### 2.8 Floor plans

None seeded. House detail pages show "The floor plan for this unit is available
on request" where the drawing would go.

### 2.9 Per-listing title sign-off

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
