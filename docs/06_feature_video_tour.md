# Feature Addendum — Video Tours

**Project:** Rakuxon City
**Version:** 1.0
**Inserts as:** Phase 5.5 in `03_IMPLEMENTATION_PLAN.md` — after the public pages, before the enquiry system
**Amends:** `01_SITE_ARCHITECTURE.md` §4 and §5.1, `02_PRD.md` §4 and §5, `04_DESIGN_SYSTEM.md` §6

---

## 1. Why

Nigerian buyers frequently cannot visit a site before committing, and diaspora buyers never can. A drone tour of a plot's boundaries and access road does work that photographs cannot. This sits directly alongside the title ribbon as trust infrastructure: one proves the paperwork, the other proves the place exists and looks as described.

---

## 2. The constraint that shapes everything

A standard YouTube iframe pulls roughly 500KB–1MB before the user presses play. The performance target in `02_PRD.md` §6 is LCP under 2.5s on a mid-range Android over 3G. Three embeds on the homepage would breach it outright.

**Therefore every video on this site uses the facade pattern**, without exception:

- Render a poster image and a play control. No iframe in the initial DOM.
- Inject the iframe only on click or Enter.
- Use `youtube-nocookie.com` as the embed host.
- Never autoplay. Never more than one iframe instantiated at a time.

This is not an optimisation to revisit later. Build it this way from the first component.

---

## 3. Data model changes

A separate table rather than a column on `Listing`, because a plot plausibly has both a drone tour and a walkthrough, and estates carry videos of their own.

```
Video
  id
  youtubeId              # the 11-character ID, not a full URL
  title
  description (nullable)
  kind: 'drone_tour' | 'walkthrough' | 'estate_overview'
      | 'progress_update' | 'testimonial'
  posterMediaId (nullable)   # custom poster; falls back to YouTube thumbnail
  durationSeconds (nullable) # display only
  listingId (nullable)       # exactly one of listingId or estateId is set
  estateId (nullable)
  featured (bool)            # eligible for the homepage section
  sortOrder (int)
  publishedAt, createdAt
```

Store the **ID only**, never a pasted URL. Admin (Phase 7) parses whatever the user pastes — `watch?v=`, `youtu.be/`, `/shorts/`, `/embed/` — and persists the extracted ID. Until Phase 7, IDs arrive through the seed script and a `youtube_id` column in the CSV importer.

Constraint: a `Video` row must have exactly one of `listingId` or `estateId` populated.

---

## 4. Functional requirements

**FR-V1.1** A listing detail page with one or more videos shows a **Video tour** block directly beneath the gallery and above the title ribbon on land pages, or beneath the gallery on home pages. Multiple videos render as a primary player with a thumbnail strip beneath.

**FR-V1.2** An estate detail page shows its videos in a third tab alongside Plots and Homes, labelled **Tours**.

**FR-V1.3** The homepage carries a **Video tours** section between Spotlight listings and Testimonials, showing up to 4 videos where `featured = true`, ordered by `sortOrder`. The section does not render at all when fewer than 2 featured videos exist — an empty or one-item carousel looks broken.

**FR-V1.4** A dedicated hub at `/tours` lists all videos, filterable by kind and by estate, paginated at 12. Each card links to its parent listing or estate.

**FR-V1.5** A dedicated page at `/tours/[slug]` shows one video at full width with its title, description, and a prominent link to the listing or estate it belongs to, plus a contextual enquiry action. These pages exist to be shared on WhatsApp and Instagram — where the client is not using WhatsApp for enquiries, a shareable video link is the closest substitute.

**FR-V1.6** No page instantiates more than one iframe simultaneously. Playing a second video unmounts the first.

**FR-V1.7** Every video facade is keyboard operable, carries an accessible label naming the video, and the injected iframe carries a `title` attribute.

**FR-V1.8** A video whose YouTube resource is unavailable renders its poster with a quiet *Video unavailable* caption rather than a broken embed. Deleted and private videos are a real operational hazard when a client manages their own channel.

**FR-V1.9** Listing and estate pages emit `VideoObject` structured data for each video, alongside the existing `RealEstateListing` markup.

---

## 5. Design

Add to `04_DESIGN_SYSTEM.md` §6.

### Video card
Follows the listing card exactly: `surface` fill, `radius-card`, hairline border, no shadow. Poster image at 16:9 with `radius-card` on the top corners.

- **Play control:** 56px circle, `accent` fill, white triangle glyph, centred on the poster. **Never YouTube's red button** — it clashes with the sage palette and reads as a third-party widget rather than part of the site.
- Duration pill bottom-right of the poster: `deep` at 70% opacity, white `caption` text, `radius-pill`.
- Kind badge top-left, using the existing badge base in `accent-tint`: *Drone tour*, *Walkthrough*, *Estate overview*, *Progress update*.
- Title at `heading` beneath the poster, parent listing or estate name at `caption` in `ink-muted`.

### Homepage section
Uses `SectionHeading` with the standard asymmetric pairing. Four cards in a 2×2 grid at `lg`, horizontal carousel below `md`. Playing a video expands it in place rather than opening a modal — a modal over the calm canvas would feel heavier than the rest of the page.

### Posters
Custom poster images are strongly preferred. YouTube's auto-generated thumbnails carry baked-in artefacts and inconsistent colour that break the page's restraint. Fall back to `maxresdefault` from `i.ytimg.com` only where no custom poster exists, and add that host to `next.config` image domains.

---

## 6. Route additions

```
/tours                 Video tour hub, filterable by kind and estate
/tours/[slug]          Single video page — built to be shared
```

Primary navigation is unchanged. `/tours` is reachable from the homepage section heading, from listing and estate video blocks, and from the footer.

---

## 7. Acceptance criteria

1. A listing with two videos shows a primary player and a thumbnail strip; switching videos unmounts the previous iframe.
2. The homepage video section renders zero iframes before any interaction, verified in the network panel on first load.
3. Homepage Lighthouse mobile performance stays at or above the pre-feature score, within 3 points.
4. A video with an invalid or removed YouTube ID renders the unavailable state, not a broken embed.
5. Every facade is reachable and activatable by keyboard alone.
6. `/tours/[slug]` renders correct Open Graph tags so a shared link previews with the poster and title.
7. The homepage section is absent entirely when fewer than 2 featured videos exist.
8. No YouTube-red play button appears anywhere on the site.

---

## 8. Deferred to Phase 7 (admin)

- Video CRUD: paste any YouTube URL form, ID extracted on save.
- Poster upload through the existing media library.
- Featured toggle and drag-to-reorder for the homepage section.
- A validity check that pings the oEmbed endpoint on save and warns if the video is private or missing.