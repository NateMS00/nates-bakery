# Nate’s Bakery

A personal baking app for Nathan (the repo is still named `backery`): import a recipe from an Instagram reel, get it in grams, bake it step by step with timers, and log what changed each time. Friends can view shared recipes read-only. React web app, mobile-first, used mostly on an iPhone in the kitchen, often from the Home Screen. Live at https://nates-bakery.vercel.app.

## Working rules

- **Talk to Nathan in English.**
- **Propose before you write.** Before creating or changing files, say what you're about to build and which files you'll touch, then wait for Nathan's go-ahead. Small fixes inside a change he already approved don't need a new confirmation.
- **Disagree when you should.** If a request conflicts with the specs, accessibility, or good practice, say so and explain why. Nathan wants the discussion, not silent compliance.
- **Act as a senior product designer and accessibility (WCAG 2.1 AA) expert** when reviewing your own output: check contrast, focus, touch targets, headings, landmarks, and responsive behavior, not just whether it builds.
- **Check the Next.js 16 docs before using an unfamiliar Next API.** This project runs Next.js 16, which differs from older versions (`proxy.ts` instead of middleware, `params` and `searchParams` as Promises); the docs for the installed version are in `node_modules/next/dist/docs/`.

## The specs are the source of truth

The product is fully specified in three layers. Read them before building anything, and follow the `layout-orchestrator` skill in `.claude/skills/` to turn them into code.

| File | Owns |
|---|---|
| `SKELETON.md` | Routes, access, navigation, flows, section order, states |
| `BONES-shell.md`, `BONES-[page].md` | Layout per route: spans, first viewport, mobile and desktop forms, overlays |
| `SKIN.md` | Design tokens (light and dark), typography, components and their states |

- When two specs disagree, the owner of that layer wins (see the orchestrator skill). Build the closest faithful version and **report the conflict**; don't edit spec files unless Nathan asks.
- The spec skills (`skeleton-generator`, `bones-generator`, `skin-generator`) are for revising the specs when Nathan asks for a structural or visual change. Update the spec first, then the code.
- `design-reference/` holds the self-hosted fonts (`fonts/`), the app icon and favicon artwork (`icons/`), and an early static preview of the Recipe page (`recipe-preview.html`, with screenshots). The preview predates the October 2026 visual round (porcelain canvas, cover photo, no tile marks before headings): it's history now, not the reference. SKIN.md and the BONES files win.
- **Impeccable** (design skill) is installed. Its `DESIGN.md` and `PRODUCT.md` are derived from SKIN.md and SKELETON.md; when they disagree, SKIN.md and SKELETON.md win. The italic Fraunces wordmark and the app icon's N are brand choices, not AI tells.

## Build decisions already made

- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4. The theme is generated from SKIN.md's YAML as CSS custom properties that keep SKIN's token names (`npm run theme`); rerun it whenever SKIN.md's tokens change.
- **Dark mode**: follows `prefers-color-scheme`, using SKIN's `colors-dark`.
- **Fonts**: Fraunces, Atkinson Hyperlegible Next, and Atkinson Hyperlegible Mono, self-hosted from `design-reference/fonts/` (SKIN.md, Font Import), not Google Fonts. Atkinson's slashed zero is intentional.
- **Backend**: Supabase (Postgres, Auth, Storage; project in Oregon) and Vercel (hosting, functions in `pdx1`). Two backends behind one interface in `lib/backend/`: `npm run dev` uses typed fixtures (`BACKERY_BACKEND=fixtures`, never allowed in production), `npm run dev:supabase` and production use Supabase. Keep both working: every data change needs its fixture too, including the empty cases.
- **Auth**: Supabase Auth, one owner account, sign-ups off; route protection in `proxy.ts` with the redirects SKELETON defines.
- **Reel import**: live behind `BACKERY_FEATURE_IMPORT`. Captions come from Apify (server-only `APIFY_TOKEN`); the recipe is read by Apple Intelligence in the iOS Shortcut, which calls `/api/import/start` and `/api/import/finish` with the owner's import key. Keep those endpoints working unchanged.
- **Database changes**: write each as a numbered SQL file in `supabase/migrations/` with a matching check in `supabase/checks/`. Nathan runs them in the Supabase SQL editor himself and ticks them off in `DEPLOY.md`.
- **Security**: never ask for or use the Supabase service_role key, the database password, or the connection string; never read or edit `.env.local`; secrets live only there and in Vercel. The import key must never ship inside a shared Shortcut.
- **Where things stand**: `PROGRESS.md` (what's built), `BACKLOG.md` (what's deferred), `DEPLOY.md` (what's been run and configured). Update `PROGRESS.md` after each reviewed change.
- **Mobile first**: build and check the iPhone layout first (390px wide), then desktop (1440px).

## Definition of done for every page

1. Typecheck, lint, and build pass.
2. Rendered with Playwright at 390px and 1440px, in light and dark, and compared against the BONES diagrams. Share the screenshots with Nathan.
3. One `h1`; landmarks present; visible 3px focus ring on every interactive element; touch targets at least 48px (64px for Bake Mode's step buttons); no horizontal scroll at 390px.
4. Every state and overlay in the BONES table renders.
5. The report the orchestrator skill asks for: files touched, gaps filled (draft copy, fixtures, stubs, missing components), and spec conflicts.
