# Rakuxon City — Project Documents

**Project:** Rakuxon City — a Rakuxon (rakuxon.com) company project
**Last updated:** 22 August 2026
**Status:** scope confirmed, no open questions. Ready to build.

---

## The project in one line

A Nigerian real estate site running two product tracks under one brand — **Land** (plots sold direct to buyers) and **Homes** (completed or in-build houses) — plus a **discreet investor lane** for private parties funding development on company-owned land. Primary action: **enquiry**. No online payment in Phase 1.

---

## Documents

| File | What it covers |
|---|---|
| `01_SITE_ARCHITECTURE.md` | Route tree, page specs, admin structure, component inventory, scalability seams |
| `02_PRD.md` | Functional and non-functional requirements, data model, acceptance criteria, risks, stack |
| `03_IMPLEMENTATION_PLAN.md` | Nine-phase build sequence — **landing page first, admin last** — with per-phase verification and the Claude Code handoff prompt |
| `04_DESIGN_SYSTEM.md` | Palette, type scale, layout rhythm, components, the title-ribbon signature, Tailwind theme |
| `05_REFERENCE_UI.png` | The client-approved reference layout the design system is derived from. Look at it before building pages |

---

## Confirmed scope

| | |
|---|---|
| Brand | Standalone identity, own domain. Rakuxon named only in the footer |
| Volume | 20–100 listings across 3 estates at launch |
| Pricing | Mixed — some published, some price on request |
| Payment plans | Terms set per listing |
| Enquiry routing | By track: land enquiries to land staff, homes to homes staff |
| Investor lane | Public and indexed, linked from the footer and homepage strip only |
| WhatsApp | Not used. Web form is the sole enquiry channel |
| Migration | Spreadsheet import, required in admin |
| Content | Admin dashboard, no CMS |
| Payments | Deferred to Phase 2; seams built now |

---

## Decisions worth remembering

1. **Shop window, not a transaction rail.** Enquiry-only, with the listing status lifecycle and structured payment plan terms built now so reservations slot in later.
2. **Land and Homes are separate tracks on a shared `Listing` base** with typed detail tables — clean filters, clean forms, cheap to add a third type.
3. **The homepage is a soft split.** Both lanes side by side, featured stock visible without choosing.
4. **The investor lane publishes no figures.** Descriptive copy, gated form, conversation offline. This is a legal boundary, not a style preference.
5. **Title documentation is the signature.** It leads on every land card and opens every plot detail page — including when the documentation is weak.

---

## Two things to raise with the client

- **Put the investor-lane constraint in writing.** If they later ask for projected returns on that page, you want the earlier advice on record.
- **No WhatsApp will cost enquiry volume** in this market. It's their call, and it's logged as a risk in `02_PRD.md` §8 — form abandonment tracking is in Phase 7 so the decision can be revisited with data rather than opinion.

---

## Where to start

Hand all six files to Claude Code and run **Phase 0 through Phase 3**. Phase 3 is the demo milestone — a full landing page matching the reference layout, running on real seeded data, ready to send the client as a visual preview.

Two caveats to carry into that conversation: nothing is editable by the client until Phase 7, and enquiry forms do not submit until Phase 6. Anything shown before then is a preview, not a working site.