# Site Architecture — Rakuxon City

**Project:** Rakuxon City — a Rakuxon (rakuxon.com) company project
**Status:** v0.2 — for review
**Scope:** Public marketing + lead-generation site with an admin dashboard. Enquiry-only. No online payment in Phase 1.

---

## 1. The project in one line

**Rakuxon City** is a Nigerian real estate site running **two product tracks under one brand** — **Land** (plots sold direct to buyers) and **Homes** (completed or in-build houses) — plus a **quiet third lane for investors** who fund development on land the company already owns. Primary action across the whole site: **enquiry**. Inventory is maintained by staff through an admin dashboard, not a CMS.

---

## 2. Locked decisions

| # | Decision | Consequence for the build |
|---|---|---|
| 1 | Site is a shop window, not a transaction rail | No escrow, no payment gateway, no KYC in Phase 1 |
| 2 | Journey ends at **enquiry** | Every listing terminates in a contextual enquiry form, not a checkout |
| 3 | Payments must slot in later without a rewrite | Listings carry real lifecycle status from day one (see §8) |
| 4 | Land and Homes are **separate tracks on a shared base** | One `Listing` base entity, two typed extensions, two hubs, two filter sets |
| 5 | Homepage is a **soft split**, not a hard fork | Both lanes shown side by side; featured listings visible without choosing |
| 6 | Investor lane is **gated and dry** | No yields, no return projections, no public pitch. Form → private conversation |
| 7 | **Admin dashboard, no CMS** | Staff CRUD for listings, estates, enquiries, media |

---

## 3. Audiences and their journeys

**A. Land buyer (B2C)**
Land hub → filter by location/size/title → plot detail → *Enquire about this plot* → callback.
Dominant anxiety: **is this land genuine?** Title type, survey number, and estate documentation must be visible on the detail page, not buried.

**B. Home buyer (B2C)**
Homes hub → filter by bedrooms/estate/build stage → house detail (gallery, floor plan, handover date) → *Book an inspection* → callback.

**C. Investor / development funder (B2B)**
Homepage strip or footer → investor page (credibility, track record, how the model works — **no numbers**) → gated form → private conversation offline.

**D. Staff / admin**
Login → dashboard → manage listings, estates, enquiries.

---

## 4. Public route tree

```
/                                  Home
/land                              Land hub (filterable index)
/land/[slug]                       Plot detail
/homes                             Homes hub (filterable index)
/homes/[slug]                      House detail
/estates                           Estates / projects index
/estates/[slug]                    Estate detail (map, plots + homes within it)
/invest                            Investor lane — credibility page
/invest/enquire                    Gated investor form
/about                             About / company story / leadership
/resources                         Buyer education index
/resources/[slug]                  Article (title verification, C of O, land fraud, payment plans)
/contact                           Contact + general enquiry
/enquire                           Standalone enquiry form (fallback / campaign landing)
/privacy                           Privacy policy (NDPR)
/terms                             Terms
```

**Deliberately absent in Phase 1:** `/account`, `/checkout`, `/reserve`, buyer login. Routes are reserved but unbuilt — see §9.

---

## 5. Page-by-page specification

### 5.1 Home (`/`)
Order of blocks, top to bottom:

1. **Hero** — plain statement of what the company does. Single search/filter entry that lets the user pick Land or Homes inline.
2. **Two-lane block** — two equal cards: *Buy Land* / *Buy a Home*. Each with a one-line promise and a count of live listings.
3. **Featured listings** — mixed from both tracks, so a visitor who won't choose a lane still sees stock.
4. **Why buy from us / trust band** — years operating, plots sold, estates delivered, title verification promise. Numbers must be real before launch.
5. **Estates strip** — 3–4 flagship estates.
6. **Buyer education teaser** — 3 resource cards. This is conversion work, not blog filler.
7. **Investor strip** — low-key, one paragraph, one CTA to `/invest`.
8. **Enquiry CTA band** → `/contact`.

### 5.2 Land hub (`/land`)
- Filters: **location/state**, **plot size**, **title type** (C of O, Governor's Consent, Gazette, Deed), **price band**, **payment plan available**, **status**.
- Card shows: estate, location, size, title type, price, status badge.
- Sort: newest, price asc/desc.
- Empty state must offer *tell us what you're looking for* → enquiry.

### 5.3 Plot detail (`/land/[slug]`)
- Gallery + site photos, location map, **plot size**, **title type**, **survey/plot number**, price, payment plan terms, estate link, documentation list.
- Status badge: Available / Reserved / Sold.
- Sticky enquiry panel — pre-fills the listing reference.
- Related plots in the same estate.

### 5.4 Homes hub (`/homes`)
- Filters: **bedrooms**, **house type** (detached, semi-detached, terrace, bungalow), **estate/location**, **build stage** (off-plan, under construction, completed), **price band**, **status**.

### 5.5 House detail (`/homes/[slug]`)
- Gallery, **floor plan**, bedrooms/bathrooms, land area + built area, **build stage and expected handover**, finishing spec, estate link, payment plan terms.
- CTA: *Book an inspection* (an enquiry with a preferred-date field).

### 5.6 Estates (`/estates`, `/estates/[slug]`)
The connective tissue between the two tracks — an estate holds both plots and homes. Detail page: overview, location map, infrastructure/amenities, development progress gallery, and two tabs listing available plots and available homes within it.

### 5.7 Invest (`/invest`)
Public, but **informational only**. How the model works in plain language, track record of delivered projects, who the company is, what a partnership process looks like end to end. **No returns, no yields, no projections, no minimum ticket published.** Single CTA → `/invest/enquire`.

### 5.8 Invest enquire (`/invest/enquire`)
Gated form: name, organisation, email, phone, capital range (banded select), preferred project type, message. Confirmation states that a member of the team will make contact — nothing more. Submissions route to a separate, restricted inbox in admin.

### 5.9 Resources (`/resources`)
Categories: Title & documentation, Buying process, Payment plans, Estate living. Each article ends with a contextual enquiry CTA.

---

## 6. Admin route tree

```
/admin/login
/admin                             Dashboard — new enquiries, listing counts by status
/admin/listings                    All listings, filter by type/status
/admin/listings/new                Type selector → Land or Home form
/admin/listings/[id]/edit
/admin/estates                     CRUD
/admin/estates/[id]/edit
/admin/enquiries                   Inbox — filter by source, status, assigned staff
/admin/enquiries/[id]              Detail + internal notes + status (New/Contacted/Qualified/Closed)
/admin/enquiries/investor          Restricted view — separate permission
/admin/resources                   Article CRUD
/admin/media                       Image library
/admin/users                       Staff accounts + roles
```

**Roles:** `admin` (full), `sales` (listings + enquiries, no investor inbox), `investor_manager` (investor inbox only).

---

## 7. Shared component inventory

| Component | Used on |
|---|---|
| `ListingCard` (variant: land \| home) | Home, hubs, estate detail, related blocks |
| `FilterBar` (config-driven per track) | Land hub, Homes hub |
| `StatusBadge` | Everywhere a listing appears |
| `EnquiryForm` (contextual, pre-filled ref) | Listing details, contact, resources, campaign pages |
| `Gallery` / `LightBox` | Listing + estate details |
| `MapEmbed` | Listing + estate details |
| `TrustBand` | Home, about, hubs |
| `LaneCard` | Home |
| `DocumentList` | Plot detail (title/documentation) |
| `BreadcrumbNav` | All detail pages |

---

## 8. Entity shape (high level — full model comes with the PRD)

```
Listing (base)
  id, slug, type: 'land' | 'home', title, description,
  estateId, location, price, priceOnRequest,
  status: 'available' | 'reserved' | 'sold' | 'draft',
  paymentPlanAvailable, media[], featured, createdAt, publishedAt

LandDetail  → listingId, plotSize, plotUnit, titleType, surveyNumber, documents[]
HomeDetail  → listingId, bedrooms, bathrooms, houseType, buildStage,
              handoverDate, builtArea, landArea, floorPlan, finishingSpec

Estate      → id, slug, name, location, geo, amenities[], media[], description
Enquiry     → id, source, listingId?, name, email, phone, message,
              status, assignedTo, createdAt
InvestorEnquiry → id, name, organisation, email, phone, capitalBand,
                  projectInterest, message, status
User        → id, email, passwordHash, role
```

`status` on `Listing` is the single most important field for Phase 2 — it is what a reservation flow will later write to.

---

## 9. Scalability seams

Built now so Phase 2 doesn't require a rewrite:

1. **Listing status lifecycle** already exists — a future `reserve` action just transitions `available → reserved`.
2. **Enquiry is an entity, not an email** — a future buyer account attaches to existing enquiry records.
3. **Routes reserved:** `/account/*`, `/land/[slug]/reserve`, `/homes/[slug]/reserve`.
4. **Payment plan is structured data**, not prose in a description field — a future schedule generator reads it directly.
5. **Media handled through a library** with IDs, so listings can be duplicated or re-used across estates.

---

## 10. Compliance and trust notes

- **Investor lane:** publishing returns, yields, or guaranteed profit turns the page into a financial promotion and pulls the client into SEC territory. Architecture keeps `/invest` descriptive and routes intent offline. Flag to the client in writing.
- **NDPR:** enquiry forms collect personal data — privacy policy, consent checkbox, and a stated retention period are required at launch.
- **Trust signals must be true.** Plots-sold and estates-delivered counters need real figures before go-live.
- **Land fraud context:** title type and documentation are primary content on plot pages, not fine print.
