# Rakuxon City

A Nigerian real estate site running two product tracks under one brand — **Land**
(plots sold direct to buyers) and **Homes** (completed or in-build houses) — plus
a gated investor lane. Enquiry-only; no online payment in Phase 1.

The specification lives in [`docs/`](docs/) and travels with the repo. Read it
before changing anything:

| Document | Covers |
|---|---|
| `docs/00_readme.md` | Project overview and confirmed scope |
| `docs/01_site_architecture.md` | Routes, page specs, admin structure |
| `docs/02_prd.md` | Requirements, data model, acceptance criteria |
| `docs/03_implementation_plan.md` | Phased build sequence |
| `docs/04_design_system.md` | Palette, type, components, Tailwind theme |
| `docs/reference/05_reference-ui.png` | The client-approved reference layout |

`docs/04_design_system.md` §10 is the source of truth for colour and type. It is
translated into Tailwind v4 `@theme` tokens in `src/app/globals.css`; no component
hard-codes a hex value or a font size. Font weight never exceeds 500, listing
cards never carry a shadow, and the page background is canvas (`#F1F4EF`).

## Getting started

```bash
pnpm install
cp .env.example .env      # fill in DATABASE_URL
pnpm db:generate
pnpm dev
```

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write (skips `docs/`) |
| `pnpm db:generate` | Regenerate Prisma Client |
| `pnpm db:migrate` | Create and apply a migration |
| `pnpm db:studio` | Prisma Studio |

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · PostgreSQL ·
Auth.js · Resend · Turnstile
