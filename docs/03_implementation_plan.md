# Implementation Plan — Rakuxon City

**Project:** Rakuxon City — a Rakuxon (rakuxon.com) company project
**Version:** 3.0 — **resequenced: presentable landing page first, admin last**
**Reads with:** `01_SITE_ARCHITECTURE.md`, `02_PRD.md`, `04_DESIGN_SYSTEM.md`, `05_REFERENCE_UI.png`

---

## Why this order

The client needs something to look at. A landing page that matches the reference layout, running on real seeded data, is worth more in week one than a working admin panel nobody outside the team will see. So the sequence front-loads the demo milestone and pushes staff tooling to the end.

**The demo milestone is Phase 3.** After it, you can send the client a link.

**What this trades away, stated plainly:**

- The client cannot edit anything until Phase 7. All content arrives by seed script or CSV import until then. If they expect to be adding listings themselves in month one, this order is wrong for them.
- Enquiry forms render from Phase 3 but do not submit until Phase 6. Anything shown to the client before Phase 6 must be described as a visual preview, not a working site. Do not let a stakeholder test a form that silently discards their input.
- Phase 1 stays where it is. Skipping the schema to reach the landing page faster means hardcoding content into components and rewriting them later — that costs more than it saves. The seed is cheap and it makes the landing page real from the first render.

---

## Phase 0 — Setup and theme

1. `create-next-app` with TypeScript, App Router, Tailwind, ESLint.
2. Prisma init against PostgreSQL (Neon or Supabase).
3. Directory structure:
   ```
   src/
     app/
       (public)/
       admin/
       api/
     components/
       ui/           # button, badge, input, accordion, carousel
       listings/
       forms/
       layout/
     lib/            # db, auth, validation, routing, import
     types/
   prisma/
   docs/             # all six documents, including the reference image
   ```
4. Apply the Tailwind theme from `04_DESIGN_SYSTEM.md` §10 verbatim.
5. Load Instrument Sans and Inter via `next/font/google`; set `canvas` as the body background.
6. Environment: `DATABASE_URL`, plus placeholders for auth, media, email, and captcha keys added in later phases.
7. Commit `docs/` so the specification travels with the repo.

**Verify:** dev server runs on the canvas background with both fonts loading; Prisma connects.

---

## Phase 1 — Schema and seed

Kept early on purpose — the landing page renders from real records, not placeholder arrays.

1. Full Prisma schema from `02_PRD.md` §5.
2. Enums for `type`, `status`, `titleType`, `houseType`, `buildStage`, `role`, `salesTrack`, `track`.
3. Indexes on `Listing.slug`, `Listing.reference`, `Listing.type + status`, `Listing.estateId`, `Enquiry.status + track`.
4. Migrate.
5. Seed: 3 estates, 12 land listings across every title type and status, 8 home listings across build stages, **at least 3 price-on-request listings** and **one survey-only land listing**, 4 articles, 3 testimonials, one admin plus one land-sales and one homes-sales user.
6. Zod schemas in `lib/validation` per entity — reused later by forms, API routes, and the CSV importer.

**Verify:** seed runs clean; a land listing resolves its `LandDetail`; POR listings have `price = null` and `priceOnRequest = true`.

---

## Phase 2 — Design primitives

Built before pages so compositions never improvise spacing or invent variants.

1. `Button` — primary, secondary, text, icon-action.
2. `Badge` base with `TitleTypeBadge`, `BuildStageBadge`, `StatusBadge`.
3. `Input`, `Select`, `Textarea`, `Checkbox` with the focus ring and inline error pattern.
4. `Accordion`, `Carousel`, `Gallery` + `Lightbox`.
5. `SectionHeading` — encodes the asymmetric pairing from design system §4 so no page hand-rolls it.
6. `PriceDisplay` — the one place handling the published / on-request split.
7. `ListingCard` in land and home variants, with the title ribbon badge leading on land.
8. `Container` with the faint column rules.
9. Scroll-reveal wrapper honouring `prefers-reduced-motion`.

**Verify:** a primitives page renders every variant against `05_REFERENCE_UI.png`; nothing uses font-weight above 500; no listing card carries a shadow.

---

## Phase 3 — Landing page  ← **demo milestone**

The full homepage per `01_SITE_ARCHITECTURE.md` §5.1, matched to the reference layout, rendering from seeded data.

1. Header with primary navigation and the *Contact us* action. Mobile navigation.
2. **Hero** — headline, right-offset supporting paragraph, category eyebrow list, primary action.
3. **Featured estate block** — large image with overlaid estate label, plus the smaller secondary estate card.
4. **Two-lane block** — *Buy land* / *Buy a home*, equal weight, live listing counts from the database.
5. **Trust band** — years operating, plots sold, estates delivered. Placeholder figures here are acceptable *only* until Phase 8; mark them in code with a `TODO: real figures` comment so the launch gate can find them.
6. **Spotlight listings** carousel, mixing both tracks.
7. **Testimonials** carousel.
8. **FAQ** accordion over the image collage.
9. **Resources teaser** — two most recent articles.
10. **Investor strip** — one paragraph, one action.
11. **Footer** — `deep` bar, contact, socials, newsletter, *A Rakuxon company*.
12. Enquiry form UI rendered but **visibly non-functional** — disabled action with a *Coming soon* state. Never a form that accepts input and discards it.

**Verify:** side-by-side against `05_REFERENCE_UI.png` at 1440px — spacing rhythm, asymmetric pairing, and type scale match. Responsive at 375 / 768 / 1024 / 1440. Lighthouse mobile performance ≥ 80 at this stage.

**Stop here and send the client a link.** Label it a visual preview.

---

## Phase 4 — Listings

1. `/land` and `/homes` hubs — server components, 12 per page.
2. `FilterBar` config-driven per track, state in URL search params, filtering in the Prisma query.
3. **Price-on-request handling per FR-1.5** — excluded from price bands, sorted last. Written once in the query builder, not per page.
4. `/land/[slug]` and `/homes/[slug]` with `generateStaticParams` and ISR.
5. **Title ribbon** beneath the gallery on plot detail per design system §7, including the survey-only neutral state.
6. Floor plan viewer and build-stage display on house detail.
7. Related listings, sold-listing behaviour, empty states.

**Verify:** filters survive refresh and a shared URL; a POR listing behaves correctly under both price sorts; the survey-only listing renders the honest neutral ribbon; a sold listing shows the alternative action.

---

## Phase 5 — Remaining public pages

1. `/estates` and `/estates/[slug]` with plots and homes tabs.
2. `/invest` — descriptive only. **Copy review gate: no returns, yields, ROI, or minimum ticket.** Linked from footer and homepage strip only, never primary navigation.
3. `/invest/enquire` form UI.
4. `/about`, `/contact`, `/resources`, `/resources/[slug]`.

**Verify:** `/invest` passes copy review against PRD §8 and is absent from primary navigation; estates with no available stock still render as portfolio evidence.

---

## Phase 6 — Enquiry system

Everything that has been UI-only becomes real here.

1. `EnquiryForm` variants wired up: listing, inspection, general, resource — pre-filled reference, consent checkbox.
2. `POST /api/enquiries` — Zod validation, Turnstile verification, per-IP rate limiting, persist, route, notify.
3. **Track routing per FR-3.3** — derive `track` from `Listing.type`, round-robin among active users whose `salesTrack` matches or is `both`. Isolated in `lib/routing` with unit tests; this is the piece most likely to break silently.
4. `POST /api/investor-enquiries` — separate route, separate table, separate notification target. No shared handler.
5. Resend templates: internal notification with reference and admin deep link, plus enquirer acknowledgement.
6. Success and failure states that never lose typed input.
7. Remove every *Coming soon* stub from Phase 3.

**Verify:** a land enquiry assigns to a land-track user, a homes enquiry to a homes-track user; an investor enquiry never touches the `Enquiry` table; rate limiting rejects rapid repeats; no disabled form remains anywhere on the site.

---

## Phase 7 — Admin dashboard

Last, as requested. Until this ships, content changes go through the seed script or a developer.

1. Auth.js credentials provider, `/admin/login`, middleware over `/admin/*`.
2. Role and track scoping enforced in middleware **and** in the query layer — a `sales` user's inbox query filters by `salesTrack`; investor routes 403 for anyone but `investor_manager` and `admin`.
3. Dashboard: new enquiries, listings by status and track, 30-day trend.
4. Listing create flow — type selector then typed form, React Hook Form plus the Phase 1 Zod schemas.
5. Media upload: multiple files, drag-to-reorder, required alt text, compression.
6. Status transition control writing `StatusChange`.
7. Estate CRUD.
8. **CSV importer per FR-6.6** — upload, column mapping, per-row validation preview, commit valid rows as drafts, idempotent on `reference`, writes an `ImportBatch` record.
9. Enquiry inbox with filters, detail, internal notes, status, reassignment.
10. Article CRUD with a rich text editor.
11. User management including `salesTrack` assignment.

**Verify:** a land-track sales user cannot reach homes enquiries by URL manipulation; importing the same CSV twice updates rather than duplicates; publishing a draft makes it appear on the public hub.

---

## Phase 8 — Launch readiness

1. SEO: per-listing metadata, OG images, `RealEstateListing` JSON-LD, sitemap, robots.
2. Accessibility: keyboard path through filters and forms, focus visibility, contrast, alt coverage, reduced motion.
3. Performance: image formats and sizes, bundle check, Lighthouse mobile ≥ 85. The design is image-heavy — expect real work here.
4. Legal: privacy policy (NDPR), terms, cookie notice, consent copy.
5. Analytics with enquiry-submission conversion events **plus form abandonment tracking** — the WhatsApp risk measurement from PRD §8.
6. Error boundaries, 404, 500.
7. **Content gate:** resolve every `TODO: real figures` from Phase 3, import and publish real listings, obtain client sign-off on every listing's title details.
8. Deploy to Vercel; configure the standalone domain.

**Verify:** all ten acceptance criteria in `02_PRD.md` §7 pass.

---

## Sequencing notes

- **Phase 3 is the checkpoint that matters commercially.** Get there, get feedback, then continue. Design feedback arriving after Phase 5 is far more expensive.
- Phases 4 and 5 can run in parallel with each other if the work is split; neither depends on the other.
- Phase 7 is genuinely independent of 4–6 and could be pulled forward if the client starts pushing to manage their own content sooner. It is last by choice, not by dependency.
- Start the content gate early regardless of phase order. Chasing real figures and per-listing title sign-off from a client takes longer than the engineering does.