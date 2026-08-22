# Implementation Plan — Rakuxon City

**Project:** Rakuxon City — a Rakuxon (rakuxon.com) company project
**Version:** 2.0
**Reads with:** `01_SITE_ARCHITECTURE.md`, `02_PRD.md`, `04_DESIGN_SYSTEM.md`

The design system now exists, so styling is no longer deferred to the end. Components are built styled from Phase 2 onward.

---

## Phase 0 — Project setup

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
   docs/             # these five documents
   ```
4. Apply the Tailwind theme from `04_DESIGN_SYSTEM.md` §10 verbatim.
5. Load Instrument Sans and Inter via `next/font/google`; set `canvas` as the body background.
6. Environment: `DATABASE_URL`, `AUTH_SECRET`, media keys, `RESEND_API_KEY`, Turnstile keys.
7. Commit `docs/` so the specification travels with the repo.

**Verify:** dev server runs on the canvas background with both fonts loading; Prisma connects.

---

## Phase 1 — Data layer

1. Full Prisma schema from `02_PRD.md` §5 — `User`, `Estate`, `Listing`, `LandDetail`, `HomeDetail`, `Enquiry`, `InvestorEnquiry`, `Article`, `Media`, `StatusChange`, `ImportBatch`.
2. Enums for `type`, `status`, `titleType`, `houseType`, `buildStage`, `role`, `salesTrack`, `track`.
3. Indexes on `Listing.slug`, `Listing.reference`, `Listing.type + status`, `Listing.estateId`, `Enquiry.status + track`.
4. Migrate.
5. Seed: 3 estates, 12 land listings spanning every title type and status, 8 home listings across build stages, **at least 3 price-on-request listings**, 4 articles, one admin plus one land-sales and one homes-sales user.
6. Zod schemas in `lib/validation` per entity, reused by API routes, forms, and the CSV importer.

**Verify:** seed runs clean; a land listing resolves its `LandDetail`; POR listings have `price = null` and `priceOnRequest = true`.

---

## Phase 2 — Design system primitives

Build these before any page, so pages compose rather than improvise.

1. `Button` — primary, secondary, text, icon-action variants.
2. `Badge` — `TitleTypeBadge`, `BuildStageBadge`, `StatusBadge`, sharing one base.
3. `Input`, `Select`, `Textarea`, `Checkbox` with the focus ring and inline error pattern.
4. `Accordion`, `Carousel`, `Gallery` + `Lightbox`.
5. `SectionHeading` — encodes the asymmetric pairing from §4 as a component, so no page hand-rolls it.
6. `PriceDisplay` — one place handling the published / on-request split.
7. `Container` with the faint column rules.
8. Scroll-reveal wrapper honouring `prefers-reduced-motion`.

**Verify:** a primitives page renders every variant; nothing uses font-weight above 500; no card carries a shadow.

---

## Phase 3 — Public listings

1. `/land` and `/homes` hubs — server components, 12 per page.
2. `FilterBar` config-driven per track, state in URL search params, filtering in the Prisma query.
3. **Price-on-request handling per FR-1.5** — excluded from price bands, sorted last. Write this once in the query builder, not per page.
4. `ListingCard` in both variants, with the title ribbon badge leading on land.
5. `/land/[slug]` and `/homes/[slug]` with `generateStaticParams` and ISR.
6. **Title ribbon** beneath the gallery on plot detail, per design system §7, including the weaker-documentation state.
7. Floor plan viewer and build-stage display on house detail.
8. Related listings, sold-listing behaviour, empty states.
9. `/estates` and `/estates/[slug]` with plots and homes tabs.

**Verify:** filters survive refresh and a shared URL; a POR listing behaves correctly under both price sorts; a survey-only listing renders the neutral ribbon honestly; a sold listing shows the alternative action.

---

## Phase 4 — Enquiry system

1. `EnquiryForm` variants: listing, inspection, general, resource — pre-filled reference, consent checkbox.
2. `POST /api/enquiries` — Zod validation, Turnstile verification, per-IP rate limiting, persist, route, notify.
3. **Track routing per FR-3.3** — derive `track` from `Listing.type`, round-robin assign among active users whose `salesTrack` matches or is `both`. Isolate this in `lib/routing` with unit tests; it is the piece most likely to break silently.
4. `POST /api/investor-enquiries` — separate route, separate table, separate notification target. No shared handler.
5. Resend templates: internal notification with reference and admin deep link, plus enquirer acknowledgement.
6. Success and failure states that never lose typed input.

**Verify:** a land enquiry assigns to a land-track user; a homes enquiry to a homes-track user; an investor enquiry never touches the `Enquiry` table; rate limiting rejects rapid repeats.

---

## Phase 5 — Admin dashboard

1. Auth.js credentials provider, `/admin/login`, middleware over `/admin/*`.
2. Role and track scoping enforced in middleware and in the query layer — a `sales` user's inbox query filters by their `salesTrack`; investor routes 403 for anyone but `investor_manager` and `admin`.
3. Dashboard: new enquiries, listings by status and track, 30-day trend.
4. Listing create flow — type selector then typed form, React Hook Form plus the Phase 1 Zod schemas.
5. Media upload: multiple files, drag-to-reorder, required alt text, compression.
6. Status transition control writing `StatusChange`.
7. Estate CRUD.
8. **CSV importer per FR-6.6** — upload, column mapping step, per-row validation preview, commit valid rows as drafts, idempotent on `reference`, write an `ImportBatch` record.
9. Enquiry inbox with filters, detail, internal notes, status, reassignment.
10. Article CRUD with a rich text editor.
11. User management including `salesTrack` assignment.

**Verify:** a land-track sales user cannot see homes enquiries by URL manipulation; importing the same CSV twice updates rather than duplicates; publishing a draft makes it appear on the public hub.

---

## Phase 6 — Home, investor lane, resources

1. Homepage in full, per architecture §5.1 — hero, featured estate, two lanes, trust band, spotlight carousel, testimonials, FAQ, resources teaser, investor strip, footer.
2. `/invest` — descriptive only. **Copy review gate: no returns, yields, ROI, or minimum ticket.**
3. `/invest/enquire` with banded capital select.
4. `/about`, `/contact`, `/resources`, `/resources/[slug]`.
5. Header and footer; mobile navigation. `/invest` appears in the footer only.

**Verify:** `/invest` passes copy review against PRD §8 and is absent from primary navigation; the two-lane block reads as equal weight.

---

## Phase 7 — Launch readiness

1. SEO: per-listing metadata, OG images, `RealEstateListing` JSON-LD, sitemap, robots.
2. Accessibility: keyboard path through filters and forms, focus visibility, contrast, alt coverage, reduced motion.
3. Performance: image formats and sizes, bundle check, Lighthouse mobile ≥ 85. The design is image-heavy — this is the phase most likely to need real work.
4. Legal: privacy policy (NDPR), terms, cookie notice, consent copy.
5. Analytics with enquiry-submission conversion events, **plus form abandonment tracking** — this is the WhatsApp risk measurement in PRD §8.
6. Error boundaries, 404, 500.
7. **Content gate:** real trust figures, real listings imported and published, client sign-off on every listing's title details.
8. Deploy to Vercel; configure the standalone domain.

**Verify:** all ten acceptance criteria in `02_PRD.md` §7 pass.

---

## Sequencing notes

- Phases 0–4 are the critical path. A functional site that captures and routes enquiries beats a beautiful one that doesn't.
- Phase 2 before Phase 3 is deliberate. Building pages first and extracting components later produces inconsistent spacing and duplicated variants.
- Phase 5 can run parallel to Phase 6 if the work is split.
- Start the content gate early. Chasing real figures and per-listing title sign-off from a client takes longer than the engineering does.
