# Product Requirements Document — Rakuxon City

**Project:** Rakuxon City — a Rakuxon (rakuxon.com) company project
**Version:** 2.0 — scope confirmed
**Companion docs:** `01_SITE_ARCHITECTURE.md`, `03_IMPLEMENTATION_PLAN.md`, `04_DESIGN_SYSTEM.md`

---

## 1. Problem statement

Rakuxon City sells land and houses in Nigeria and separately raises development capital from private investors. All three activities currently run on word of mouth and offline conversation. There is no single place a serious buyer can see verified stock, check title documentation, and register interest — and no credible public surface for the investor arm.

The site does three jobs, in priority order:

1. **Present verified inventory** — land and homes — with the documentation buyers need to trust it.
2. **Capture qualified enquiries** and route them to the right sales staff with full context attached.
3. **Give the investor arm a credible, compliant surface** that converts interest into a private conversation.

It is not a transaction platform in Phase 1.

---

## 2. Goals and non-goals

### Goals

- Every listing is browsable, filterable, and terminates in a contextual enquiry.
- Title type and documentation are first-class content on land listings.
- Staff maintain inventory without developer involvement, including bulk import from spreadsheet.
- Enquiries are stored records with lifecycle status, routed by track.
- Architecture supports reservations and payments in Phase 2 without a data migration.

### Non-goals (Phase 1)

- Online payment, escrow, deposit collection
- Buyer accounts or saved searches
- KYC, buyer document upload, e-signature
- Published investment returns, yields, or projections
- Automated title verification against government registries
- WhatsApp integration (see §8)
- Multi-language support

---

## 3. Users and permissions

| Role                 | Access                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Public visitor**   | All public routes, no authentication                                                                                     |
| **Sales**            | Listings and estates CRUD; enquiry inbox **scoped to their sales track** (`land`, `homes`, or `both`). No investor inbox |
| **Investor manager** | Investor enquiry inbox only                                                                                              |
| **Admin**            | Everything, plus user management, CSV import, and article CRUD                                                           |

Investor enquiries are segregated by permission at the middleware layer, not merely hidden in the navigation.

---

## 4. Functional requirements

### 4.1 Listings (public)

**FR-1.1** The land hub lists all `type = 'land'` listings where `status != 'draft'`, paginated at 12 per page.

**FR-1.2** Land filters: location/state, plot size range, title type, price band, payment plan availability, status. Filters combine with AND and are reflected in the URL query string so results are shareable.

**FR-1.3** The homes hub lists `type = 'home'` listings. Filters: bedrooms, house type, estate, build stage, price band, status.

**FR-1.4** Sort options: newest (default), price ascending, price descending.

**FR-1.5** **Price-on-request handling.** Listings with `priceOnRequest = true` display _Price on request_, are excluded from price-band filter results, and sort last under both price sorts. This is a first-class case, not an edge case — the client publishes mixed pricing.

**FR-1.6** Sold listings remain visible with a `Sold` badge; the enquiry action is replaced by _Notify me of similar listings_. Removing sold stock destroys the signal that stock actually moves.

**FR-1.7** A plot detail page displays gallery, location map, plot size, **title type**, survey/plot number, price or POR, payment plan terms, linked estate, and a documentation list.

**FR-1.8** A house detail page displays gallery, floor plan, bedrooms, bathrooms, house type, built area, land area, **build stage**, expected handover date, finishing specification, linked estate, price, payment plan terms.

**FR-1.9** Every detail page carries a sticky enquiry panel pre-filled with the listing reference.

**FR-1.10** Every detail page shows 3 related listings from the same estate, falling back to the same location.

**FR-1.11** Empty filter results render a _tell us what you're looking for_ enquiry prompt, never a bare "no results".

### 4.2 Estates

**FR-2.1** An estate detail page shows overview, location map, amenities, development progress gallery, and two tabs listing available plots and available homes.

**FR-2.2** Estates with no available stock still render, showing sold-out or delivered state.

### 4.3 Enquiries

**FR-3.1** Enquiry forms capture name, email, phone, message, plus source context: `listingId`, `pagePath`, and campaign parameter where present.

**FR-3.2** House-detail enquiries include an optional preferred inspection date.

**FR-3.3** **Track routing.** On submission, an enquiry originating from a listing derives its `track` from `Listing.type` and auto-assigns to an active user whose `salesTrack` matches (`land` or `homes`), or `both`. Assignment is round-robin among eligible users. Non-listing enquiries default to unassigned and appear to all sales users.

**FR-3.4** On submission the system persists an `Enquiry`, notifies the assigned user by email, and sends the enquirer an acknowledgement.

**FR-3.5** Submission requires an explicit consent checkbox referencing the privacy policy.

**FR-3.6** Forms are protected by an invisible challenge (Turnstile or hCaptcha) plus server-side per-IP rate limiting.

**FR-3.7** The web form is the sole enquiry channel. Phone number and email are displayed for direct contact but are not tracked as enquiries.

### 4.4 Investor lane

**FR-4.1** `/invest` is public and indexed but reachable only from the footer and the homepage strip — not the primary navigation.

**FR-4.2** `/invest` **must not** publish returns, yields, ROI figures, minimum ticket sizes, or profit projections. Copy review is a launch gate. See §8.

**FR-4.3** `/invest/enquire` captures name, organisation, email, phone, capital range (banded select), project type interest, message, consent.

**FR-4.4** Investor submissions write to `InvestorEnquiry` and notify a restricted inbox. They never appear in the sales inbox and are never round-robin assigned.

**FR-4.5** The confirmation state says only that the team will make contact.

### 4.5 Resources

**FR-5.1** Articles are categorised: Title and documentation · Buying process · Payment plans · Estate living.

**FR-5.2** Each article closes with a contextual enquiry action.

**FR-5.3** Articles support headings, images, tables, and internal links to listings or estates.

### 4.6 Admin

**FR-6.1** Email and password authentication with hashed credentials. No public registration.

**FR-6.2** Creating a listing begins with a type selector; the form then renders only that type's fields.

**FR-6.3** Listings save as `draft` and require an explicit publish action.

**FR-6.4** Status transitions: `draft → available → reserved → sold`, with `reserved → available` permitted. Every transition writes a `StatusChange` row with actor and timestamp.

**FR-6.5** Image upload supports multiple files, drag-to-reorder, required alt text, and automatic compression and format conversion.

**FR-6.6** **CSV import.** An admin can upload a spreadsheet of listings, map its columns to fields in a preview step, see per-row validation errors before committing, and import valid rows as drafts. Import is idempotent on `reference` — re-importing updates rather than duplicates.

**FR-6.7** The enquiry inbox filters by status, track, assigned staff, and date. Each enquiry supports internal notes and a status of New / Contacted / Qualified / Closed.

**FR-6.8** The dashboard shows new enquiry count, listings by status and track, and enquiries received in the last 30 days.

---

## 5. Data model

```
User
  id, email (unique), passwordHash, name,
  role: 'admin' | 'sales' | 'investor_manager',
  salesTrack: 'land' | 'homes' | 'both' | null,     # null for non-sales roles
  isActive, lastLoginAt, createdAt

Estate
  id, slug (unique), name, location, state,
  latitude, longitude, description, amenities[],
  status: 'active' | 'sold_out' | 'delivered',
  media[], createdAt, updatedAt

Listing                                  # base entity, both tracks
  id, slug (unique), reference (unique, e.g. RXC-LND-0142),
  type: 'land' | 'home',
  title, description,
  estateId (nullable), location, state,
  price (nullable), priceOnRequest (bool, default false),
  status: 'draft' | 'available' | 'reserved' | 'sold',
  paymentPlanAvailable (bool),
  paymentPlanTerms (json: depositPercent, durationMonths, frequency, notes),
  featured (bool), media[],
  createdAt, updatedAt, publishedAt

LandDetail                               # 1:1 where type = 'land'
  listingId, plotSize, plotUnit: 'sqm' | 'plots' | 'acres' | 'hectares',
  titleType: 'c_of_o' | 'governors_consent' | 'gazette'
           | 'deed_of_assignment' | 'excision' | 'survey_only',
  surveyNumber (nullable), documents[] (label + optional file),
  topography (nullable), roadAccess (nullable)

HomeDetail                               # 1:1 where type = 'home'
  listingId, bedrooms, bathrooms,
  houseType: 'detached' | 'semi_detached' | 'terrace'
           | 'bungalow' | 'duplex' | 'apartment',
  buildStage: 'off_plan' | 'under_construction' | 'completed',
  handoverDate (nullable), builtArea, landArea,
  floorPlan (media, nullable), finishingSpec (text), features[]

Enquiry
  id, source: 'listing' | 'contact' | 'resource' | 'campaign' | 'general',
  track: 'land' | 'homes' | null,                   # derived from listing
  listingId (nullable), pagePath, campaign (nullable),
  name, email, phone, message, preferredInspectionDate (nullable),
  status: 'new' | 'contacted' | 'qualified' | 'closed',
  assignedToUserId (nullable), internalNotes[],
  consentGivenAt, ipAddress, createdAt

InvestorEnquiry
  id, name, organisation, email, phone,
  capitalBand, projectInterest, message,
  status: 'new' | 'contacted' | 'qualified' | 'closed',
  internalNotes[], consentGivenAt, createdAt

Article
  id, slug (unique), title, category, excerpt, body,
  coverImage, status: 'draft' | 'published',
  publishedAt, createdAt, updatedAt

Media
  id, url, alt, width, height, mimeType, sizeBytes, createdAt

StatusChange
  id, listingId, fromStatus, toStatus, changedByUserId, createdAt

ImportBatch                              # CSV migration audit
  id, filename, rowCount, successCount, errorCount,
  errors (json), importedByUserId, createdAt
```

**Design notes**

- `Listing` plus typed detail tables rather than one wide nullable table. Filters, forms, and validation stay clean, and a third type later costs one table.
- `reference` is human-readable because sales staff quote it on the phone — and it is the idempotency key for CSV import.
- `paymentPlanTerms` is structured per listing, matching the confirmed per-listing model. Phase 2's schedule generator reads it directly.
- `Enquiry.track` is denormalised rather than joined through `Listing` so the inbox can be scoped without a join on every query, and so the routing decision survives a listing being deleted.
- `StatusChange` gives an audit trail from day one — necessary the first time a plot is disputed.

---

## 6. Non-functional requirements

| Area                | Requirement                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance**     | LCP under 2.5s on a mid-range Android over 3G. Nigerian mobile conditions are the baseline, not a stretch case                            |
| **Images**          | WebP/AVIF with responsive sizes; galleries lazy-load below the fold. The design is image-heavy, so this is load-bearing, not polish       |
| **Mobile**          | Mobile-first. Most traffic will be Android phones                                                                                         |
| **SEO**             | Server-rendered listing and estate pages, unique meta per listing, `RealEstateListing` structured data, XML sitemap, canonical URLs       |
| **Accessibility**   | WCAG 2.1 AA: keyboard navigation, visible focus, alt text enforced on upload, contrast compliance, reduced motion respected               |
| **Security**        | Hashed passwords, CSRF protection, rate-limited forms, no public registration, admin behind middleware, signed URLs for private documents |
| **Data protection** | NDPR: privacy policy, explicit consent, stated retention period, deletion on request                                                      |
| **Availability**    | Static/ISR public pages so the marketing site survives an admin or database hiccup                                                        |

---

## 7. Acceptance criteria

Phase 1 is complete when:

1. A visitor filters land by state, size, and title type, opens a plot, sees its title type and documentation, and submits an enquiry that arrives assigned to a land sales user with the listing reference attached.
2. A visitor filters homes by bedrooms and build stage, opens a house, views the floor plan and handover date, and books an inspection with a preferred date — routed to a homes sales user.
3. A price-on-request listing displays correctly, is excluded from price-band filtering, and sorts last under both price sorts.
4. An estate page lists both its available plots and its available homes.
5. A sales user with `salesTrack = 'land'` sees only land enquiries and receives 403 on the investor inbox URL.
6. An admin imports a CSV of listings, sees per-row validation errors in a preview, commits valid rows as drafts, and re-importing the same file updates rather than duplicates.
7. `/invest` contains no returns, yields, or projections, verified by copy review, and is linked only from the footer and homepage strip.
8. Every form requires consent and is protected against automated submission.
9. Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95.
10. Sold listings remain visible with correct badging and the alternative action.

---

## 8. Risks

| Risk                                                                                     | Severity        | Mitigation                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Investor lane reads as a public offer of investment, exposing the client to SEC scrutiny | **High**        | Descriptive copy only, no figures, gated form, legal review of `/invest` before launch, written advice to the client on record                                                                                                                                                                                        |
| Trust figures launch as placeholders                                                     | **High**        | Real numbers required before go-live; placeholders block launch                                                                                                                                                                                                                                                       |
| Documentation shown on a listing is inaccurate                                           | **High**        | Client sign-off per listing at publish; publishing is a deliberate action, never automatic                                                                                                                                                                                                                            |
| **No WhatsApp channel suppresses enquiry volume**                                        | **Medium-High** | Confirmed as a client decision, not an oversight. Nigerian buyers heavily favour WhatsApp; expect lower form conversion than a comparable site with it. Recommend measuring form abandonment for 60 days post-launch and revisiting. Architecture keeps the door open — adding a deep-link component later is trivial |
| CSV import produces malformed listings that reach the public site                        | Medium          | Import commits as `draft` only; publishing stays a separate manual action                                                                                                                                                                                                                                             |
| Mixed pricing confuses filtering                                                         | Medium          | POR handling specified explicitly in FR-1.5 and covered by acceptance criterion 3                                                                                                                                                                                                                                     |
| Scope creep toward reservations mid-build                                                | Medium          | Phase 1 boundary written; seams already exist                                                                                                                                                                                                                                                                         |
| Enquiries go unanswered and the site looks dead                                          | Medium          | Status lifecycle plus dashboard counts; agree an internal response SLA with the client                                                                                                                                                                                                                                |

---

## 9. Stack

| Layer     | Choice                           | Rationale                                                         |
| --------- | -------------------------------- | ----------------------------------------------------------------- |
| Framework | Next.js (App Router), TypeScript | SSR/ISR for listing SEO; one deployable                           |
| Styling   | Tailwind CSS                     | Token-driven, matches the design system in `04`                   |
| Database  | PostgreSQL                       | Relational fit for the Listing/detail/estate model                |
| ORM       | Prisma                           | Typed schema, fast migrations                                     |
| Auth      | Auth.js, credentials provider    | Staff-only, no social login                                       |
| Media     | Cloudinary or UploadThing        | Transformation and CDN without building an image pipeline         |
| Email     | Resend                           | Notifications and acknowledgements                                |
| CSV       | PapaParse + Zod                  | Parse client-side for preview, validate server-side before commit |
| Hosting   | Vercel                           | Already in your toolchain                                         |

At 20–100 listings across 3 estates, a single Next.js app is comfortably the right size. A separate NestJS API would add a deployment without buying anything — take that route only if Rakuxon later needs other properties consuming the same inventory data.
