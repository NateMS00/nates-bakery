# Progress

Where the build stands, for picking it up again. Updated 2026-10-15.

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
- Import is on in production (`BACKERY_FEATURE_IMPORT`) as of 2026-10-15 — see "Reel import live" below.
- Smoke-tested live: sign in, recipe, rating, sharing (read-only, "Shared by Nate"), revoke, password reset. Add to Home Screen checked on Nathan's iPhone (2026-10-15): the app icon looks right.

## Reel import live (2026-10-15)

The caption → recipe pipeline, migrations 0002 (2026-10-13) and 0003 (2026-10-15, retry-once, `import_get_caption`), and the real hand-off, all committed and turned on in production:

- `lib/import/apify.ts`: the real caption fetch (Apify's official Instagram scraper), server-side only.
- `lib/import/extract.ts` / `toEditorState.ts`: the model's reply → the Recipe Editor's form state, grams computed by the app's own table. Tolerant of a markdown code fence and the dropped-character corruption found on Nathan's real Shortcut; the step key is now `instruction` (was `text`) so that corruption can't recur.
- `app/api/import/start`, `app/api/import/finish` (`lib/import/server.ts`): what the Shortcut calls, backend-agnostic, `maxDuration = 60` with Apify's own fetch timed out a few seconds under that. Every response (including errors) is HTTP 200 with the status in the body, and carries an `open` URL built server-side so the Shortcut never constructs one itself.
- `/import` hands the link to `shortcuts://run-shortcut` and polls for a ready draft; failures and "already imported" arrive via the Shortcut's own redirect, not an in-browser state.
- `lib/backend/supabase/data.ts`: every `DataBackend` method is real, including drafts (`getDrafts`, `getDraft`, `saveDraftContent`, `saveImport`, `discardDraft`) and recipe pictures (`resolvePicture`/`signThumbnail`, a signed URL copied into Storage the first time a ready draft is opened). Review Import's Source panel now displays that picture (it only ever showed the placeholder before, 2026-10-15).
- `docs/shortcut-guide.md`: the real Shortcut's actions in order. Nathan built it in the Shortcuts app on his Mac, using Import Questions so the import key is asked for at install time rather than shipped in the Shortcut file.
- `APIFY_TOKEN` and `BACKERY_FEATURE_IMPORT=on` added to Vercel (Production and Preview); see `DEPLOY.md`.

Verified end to end from Nathan's iPhone (2026-10-15): Instagram → Share → Nate's Bakery → draft opens in Safari, through to a saved recipe with its thumbnail. Known rough edges are in `BACKLOG.md` (the Shortcut's share link is still a placeholder; the model occasionally over-captures "amount"; a step's time range should use the lower number).

## App icon (2026-10-15)

`scripts/generate-icons.mjs` (`npm run icons`) rasterizes SKIN's `app-icon` and `favicon` components from `design-reference/icons/` into `public/`: `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, a 1024 master, `favicon.svg`, and a 32px `favicon.ico` (hand-built PNG-in-ICO; `sharp` has no native ICO encoder). Strips each source SVG's C2PA provenance block first. Wired into `app/layout.tsx`'s `metadata.icons` and `app/manifest.ts`'s `icons` (192 and 512, purpose `any` only — no maskable icon yet, BACKLOG). The wordmark's sharp cut (`SOFT 0`/`opsz 144`) was tried and reverted — its hairlines broke up at 1x — but the app icon's N is large enough to keep it; favicon follows the wordmark back to soft. Checked on Nathan's iPhone Home Screen (2026-10-15): looks right.

## Next

Priority order (Nathan, 2026-10-13; reel import done 2026-10-15, app icon done 2026-10-15):

1. Timer alerts (locked-phone notifications for Bake Mode timers).

The other BACKLOG items come after this.

## Half-finished and stubbed

Nothing is half-built or uncommitted. These are deliberate stubs, or genuinely done but not yet live:

- **Data and auth in development and tests:** the fixtures backend (`lib/backend/fixtures`): in-memory fixtures and a stub owner session (`owner@backery.local` / `backery-owner`; reset "emails" go to the server log). Production uses Supabase.
- **Import, in fixtures mode only:** the fixtures backend's caption fetch is a stand-in (`fixturesFetchCaption`, `lib/backend/fixtures/data.ts`) — a canned caption, no real Apify call; reel ids starting with `Cprivate`, `Cdeleted`, or `Cnorecipe` fail with that reason. The Supabase backend calls the real `fetchReel` (`lib/import/apify.ts`) and is live in production.
- **Timers:** kept in the browser, not on a server, so locked-phone alerts can't be scheduled; no notifications are sent. The chime is synthesized until a real sound is chosen.
- **Placeholders:** the Shortcut install link (`SHORTCUT_URL`, `lib/data/import.ts`) — Nathan's own Shortcut is built and working (`docs/shortcut-guide.md`), but it carries his personal import key, so it can't be shared as-is; a separate, shareable copy is still needed (BACKLOG). Recipe pictures in fixtures mode are drawn from local placeholder SVGs; the Supabase backend returns a real signed URL (`resolvePicture`/`signThumbnail`, `lib/backend/supabase/data.ts`), live-tested against the real Storage bucket (2026-10-15).
- **Owner name** on shared pages ("Shared by Nate") is a constant in `lib/auth/rules.ts` until accounts exist.
- **Privacy copy** is a draft for Nathan to review before launch (BACKLOG).
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
