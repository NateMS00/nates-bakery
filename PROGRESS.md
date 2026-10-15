# Progress

Where the build stands, for picking it up again. Updated 2026-10-13.

## Done

Prompts 1–9 from `PROMPTS.md` are built, reviewed, and committed. Each has a Playwright spec in `tests/visual/` that renders it at 390px and 1440px in light and dark; all 430 checks pass on a clean run (the 38 skipped are the phone-only viewport tests in desktop projects).

| Prompt | Route | Commits |
|---|---|---|
| 1. Theme, shell, Recipe page | `/recipes/:recipeId` | `b78f597`, review fixes `63926d0` |
| 2. Library | `/recipes` | `66b611c`, review fixes `d0fc51a` |
| 3. Review Import and the recipe editor | `/import/:draftId`, `/recipes/new`, `/recipes/:recipeId/edit` | `4463c4c`, review fixes `d1fdebc`, `b17c01e` |
| 4. Import | `/import` | `c8530ee`, review fixes `0216013` |
| 5. Bake Mode | `/recipes/:recipeId/bake` | `38dae5b`, review fixes `bcf1c5a`, timer sort `d7bc884` |
| 6. Bake Log | `/recipes/:recipeId/log` | `c8ffc52`, review fixes `d4eb83a`, `658fc0e` |
| 7. Shared recipe | `/r/:shareToken`, `/r/expired` | `02ca899` |
| 8. Auth and system pages | `/login`, `/forgot-password`, `/reset-password`, `/privacy`, not-found, error | `d869180`, review fixes (below) |

Also in place across the app: the theme generated from `SKIN.md` (`npm run theme`), self-hosted fonts, the App and Focus shells, SKIN's page top, the overlay sizing rule, and the shared destructive-confirmation dialog.

## Prompt 6 review (2026-09-30)

Agreed: the Discard check also covers date and scale changes; Edit focuses What changed; future dates are rejected. Then:

- **Local date:** "today" is the device's local date, not UTC; a test in America/Bogota at 8 pm checks that it defaults to that day and that tomorrow is rejected. Dialog content now renders only in the browser, so a server's date can't leak into the form.
- **"Bake saved"** is announced politely after a new entry (once the Rating prompt closes) and after an edit; the highlight is no longer the only feedback.
- **Scale field:** the "×" suffix (and every field suffix) is hidden from screen readers; the label stays "Scale"; `inputmode="decimal"`.
- **Bake Mode timers** stay sorted soonest-first, now recorded in BONES-recipes-bake 1.2.1.
- **`?edit=<entryId>`** (SKELETON 1.3.2, BONES-recipes-log 1.1.0): Add notes (on the log and the Recipe page) and the entry menu's Edit open that entry's form directly; the link survives a refresh. Opening and closing replace the history entry; an unknown id drops the param with no error. Focus returns to the opener, or to the entry's heading when the opener is gone or the form came from a link.
- Specs updated by Nathan: SKELETON 1.3.2, BONES-recipes-log 1.1.0, BONES-recipes-bake 1.2.1.

## Prompt 7 review (2026-09-30)

- `time-mark` is bold in the body text colour with no underline (SKIN.md update), on the Recipe page, the shared page, and in Bake Mode's step text; Bake Mode's timer buttons are unchanged.
- BACKLOG: Open Graph link preview for shared recipes.

## Prompt 8 review (2026-09-30)

Recorded in BONES-system.md 1.0.0 and BONES-shell.md 1.5.0 (both by Nathan); the build was checked against them:

- Footer at the bottom of short pages in the App shell too (the public shell already did).
- Forgot password: the sent state replaces the intro, the notice, and the form; new copy ("If there's a Backery account for …").
- Privacy: Reels says the caption and audio go to a transcription and extraction service.
- A signed-in owner opening `/login?next=` goes to that same-site path, not always `/recipes`.
- Tests: the password is cleared after a wrong sign-in; the footer sits at the bottom of Not found.

## Prompt 9: accessibility audit (2026-09-30)

Audit tooling in `playwright.audit.config.ts` (`npx playwright test --config playwright.audit.config.ts`; results in `audit-results/`, not committed). axe reports no violations on any page. Fixed after Nathan's decisions:

- Tablet (768–1279): Scale and Ingredients take 4 of 8 columns and Steps the other 4, on the Recipe and shared pages (BONES-recipes-detail 1.4.0, BONES-r-detail 1.1.0); every Scale preset is at least 48px wide.
- "Watch reel" (Recipe header, Review Import's Source) has a 48px tap area with no visual change.
- Library cards are named title first ("Fudgy brownies, Cookie & bar, rated 5 out of 5, favorite, Baked Mon 28 Sep").
- Accepted: truncated text under the text-spacing test. No action: the Timer alerts sheet's heading order.
- BACKLOG: the Privacy promises review, and the flaky editor row-menu test.

## Phase 1 online (2026-10-01)

Live at **https://nates-bakery.vercel.app** (private repo `NateMS00/nates-bakery`, Vercel Hobby, functions in Portland `pdx1`; Supabase West US, Oregon). See `DEPLOY.md`.

- App renamed **Nate’s Bakery** (specs and code); shared pages read "Shared by Nate".
- `lib/backend`: one switch for data and auth. `BACKERY_BACKEND=fixtures` (dev, Playwright) or Supabase (production; fixtures are refused on Vercel production).
- Supabase: `supabase/migrations/0001_init.sql` (tables, owner-only RLS, `save_recipe`, `shared_recipe` for anonymous visitors), checked by `supabase/checks/0001_verify.sql` (19/19) and `tests/supabase` (PGlite + live anonymous checks).
- Supabase Auth: one owner, sign-ups off, minimum password 12; reset through Supabase's default email (PKCE code to `/auth/confirm`, single use, same browser).
- Import is off in production (`BACKERY_FEATURE_IMPORT`), with New recipe as the Library's primary action.
- Smoke-tested live: sign in, recipe, rating, sharing (read-only, "Shared by Nate"), revoke, password reset. Not yet: Add to Home Screen on the iPhone.

## Next

Priority order (Nathan, 2026-10-13):

1. Reel import (connect the import service; Import is off in production until then).
2. Timer alerts (locked-phone notifications for Bake Mode timers).
3. App icons for the Home Screen (BACKLOG).

The other BACKLOG items come after these.

## Half-finished and stubbed

Nothing is half-built or uncommitted. These are deliberate stubs until the backend is chosen:

- **Data and auth in development and tests:** the fixtures backend (`lib/backend/fixtures`): in-memory fixtures and a stub owner session (`owner@backery.local` / `backery-owner`; reset "emails" go to the server log). Production uses Supabase.
- **Import service:** takes 4.5 seconds and always produces the same Kouign-amann draft; reel ids starting with `Cprivate`, `Cdeleted`, or `Cnorecipe` fail.
- **Timers:** kept in the browser, not on a server, so locked-phone alerts can't be scheduled; no notifications are sent. The chime is synthesized until a real sound is chosen.
- **Placeholders:** the Shortcut install link, reel thumbnails.
- **Owner name** on shared pages ("Shared by Nate") is a constant in `lib/auth/rules.ts` until accounts exist.
- **Privacy copy** is a draft for Nathan to review before launch (BACKLOG).
- **Import** isn't connected to Supabase; it runs only on fixtures with `BACKERY_FEATURE_IMPORT=on`.
- **Fault injection:** the `backery_stub_fail_saves` and `backery_stub_fail_loads` cookies make saves or loads fail, for the error states.

Known issues and follow-ups are in `BACKLOG.md`.

## iPhone testing (2026-09-30)

- `npm run dev:lan` serves the dev server on the local network (`next.config.ts` allows this machine's own LAN addresses); open `http://<Mac's IP>:3000` in Safari. Plain HTTP, so wake lock, clipboard read, and notifications are unavailable on the phone.
- Everything pinned to the bottom (sheets, action bars, Bake Mode's step nav and timer strip, the full-screen log form) follows the visual viewport through `components/system/ViewportVars.tsx` and the `pin-bottom` utility, so it stays above Safari's toolbar and the keyboard. Tested with a simulated visual viewport (`tests/visual/viewport.spec.ts`) in Chromium and, since 2026-10-13, in WebKit (`mobile-webkit`).
- `suppressHydrationWarning` on `<html>` and the text inputs, for attributes Chrome for iOS injects before hydration.
- Confirmed in Safari on the iPhone (2026-10-01), after a debug readout found the causes: sheets use `height: auto` on phones (Safari sized `fit-content` from the insets and clipped them to 118px); the full-screen log form fills the strip around Safari's address pill above the keyboard; the focused field is re-scrolled into view while the keyboard opens, with the footer's height as scroll padding; focus rings show for keyboard use only (`components/system/InputModality.tsx`), while focus still moves as BONES-shell asks; row menu sheets start on their first action.

## Running it

Node 24 (LTS) through nvm, matching Vercel's 24.x: `nvm use` (reads `.nvmrc`), `npm ci`, then `npm run dev`. Playwright's browsers once per machine: `npx playwright install chromium webkit`. Checks: `npm run typecheck`, `npm run lint`, `npm run build`, then `npx playwright test`. Without a browser: `npx playwright test --config playwright.unit.config.ts` (the import's quantity parser, grams table, and model-output reader) and `--config playwright.supabase.config.ts` (the database, in PGlite; live checks too when `.env.local` is loaded). Screenshots land in `screenshots/`, which isn't committed.

The suite runs in Playwright's own Chromium (`mobile-light`, `mobile-dark`, `desktop-light`, `desktop-dark`) and in WebKit at iPhone size (`mobile-webkit`: iPhone 13 user agent, 390×844, light), so Safari-style bugs show up; `--project mobile-webkit` runs WebKit alone. WebKit (2026-10-13): 113 passed, 9 skipped; the Chromium projects: 450 passed, 38 skipped. In iPhone-sized WebKit the tests skip keyboard Tab checks (Tab only visits form fields there) and the Loading-state screenshots (WebKit's screenshots wait for a streamed page to finish); see `phoneWebKit` in `tests/visual/helpers.ts`.
