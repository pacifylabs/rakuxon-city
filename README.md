# Rakuxon City

A Nigerian real estate site running two product tracks under one brand — **Land**
(plots sold direct to buyers) and **Homes** (completed or in-build houses) — plus
a gated investor lane. Enquiry-only; no online payment in Phase 1.

The specification lives in [`docs/`](docs/) and travels with the repo. Read it
before changing anything:

| Document                             | Covers                                        |
| ------------------------------------ | --------------------------------------------- |
| `docs/00_readme.md`                  | Project overview and confirmed scope          |
| `docs/01_site_architecture.md`       | Routes, page specs, admin structure           |
| `docs/02_prd.md`                     | Requirements, data model, acceptance criteria |
| `docs/03_implementation_plan.md`     | Phased build sequence                         |
| `docs/04_design_system.md`           | Palette, type, components, Tailwind theme     |
| `docs/reference/05_reference-ui.png` | The client-approved reference layout          |

Open questions, placeholder content and launch gates are tracked in
[`TODO.md`](TODO.md).

`docs/04_design_system.md` §10 is the source of truth for colour and type. It is
translated into Tailwind v4 `@theme` tokens in `src/app/globals.css`; no component
hard-codes a hex value or a font size. Font weight never exceeds 500, listing
cards never carry a shadow, and the page background is canvas (`#F1F4EF`).

## Getting started

Nothing is required beyond Node and pnpm. No database, no Docker, no `.env`.

```bash
pnpm install
pnpm build && pnpm start
```

The site serves a bundled snapshot of the seeded catalogue
(`src/data/snapshot.json`), which is enough because everything public is
read-only until the admin dashboard arrives in Phase 7. This is the path to
deploy for a preview.

### Working on the data layer

Set `DATABASE_URL` and Postgres takes over, with nothing else to change:

```bash
docker compose up -d          # optional — any Postgres will do
cp .env.example .env          # then set DATABASE_URL
pnpm db:migrate && pnpm db:seed
pnpm snapshot                 # refresh the fallback from the seed
pnpm verify:parity            # assert both read paths agree
```

`pnpm snapshot` is what keeps the two in step. Run it after changing the seed,
and `pnpm verify:parity` will tell you if you forget.

## Scripts

| Command              | Does                                                          |
| -------------------- | ------------------------------------------------------------- |
| `pnpm dev`           | Development server                                            |
| `pnpm build`         | Production build                                              |
| `pnpm typecheck`     | `tsc --noEmit`                                                |
| `pnpm lint`          | ESLint                                                        |
| `pnpm format`        | Prettier write (skips `docs/`)                                |
| `pnpm db:generate`   | Regenerate Prisma Client                                      |
| `pnpm db:migrate`    | Create and apply a migration                                  |
| `pnpm db:studio`     | Prisma Studio                                                 |
| `pnpm snapshot`      | Rebuild the no-database fallback from the seed                |
| `pnpm verify:seed`   | Assert the seed covers every enum and edge case               |
| `pnpm verify:parity` | Assert Postgres and the snapshot agree (needs `DATABASE_URL`) |
| `pnpm verify:video`  | Assert the video facade's guarantees still hold               |
| `pnpm review:invest` | Copy review for the gated investor lane                       |

## A note on speed

Static pages are prerendered and serve in single-digit milliseconds. The
filterable hubs (`/land`, `/homes`, `/tours`, `/resources`) query on each
request, so their speed is dominated by how far the app sits from the database
— measured at roughly a second per page with the app in Nigeria and the
database in `us-east-2`, against 12–18 ms for the same build with no database
at all.

**Deploy the app in the same region as its database.** See `TODO.md` §4.7 for
the measurements.

In development, Turbopack compiles each route on first visit, so the first hit
to a page is several seconds and every one after is under two. That is not what
production does.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · PostgreSQL ·
Auth.js · Resend · Turnstile
