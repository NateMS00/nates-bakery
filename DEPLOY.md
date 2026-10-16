# Deploy checklist (phase 1)

Supabase (Postgres + Auth) and Vercel (hosting). Secrets live only in `.env.local` and
in Vercel's environment variables, never in the repo.

## Supabase (project: West US, Oregon)

- [x] Run `supabase/migrations/0001_init.sql` in the SQL editor (2026-10-01).
- [x] Run `supabase/checks/0001_verify.sql`: all 19 rows ok (2026-10-01).
- [x] Run `supabase/migrations/0002_import.sql` in the SQL editor (reel import: notes, drafts, the import key, the thumbnail bucket) (2026-10-13).
- [x] Run `supabase/checks/0002_verify.sql`: all 21 rows ok (2026-10-13). Live checks after it: 31 passed.
- [x] Run `supabase/migrations/0003_retry.sql` in the SQL editor (the automatic retry-once; renames `import_retry` to `import_get_caption`) (2026-10-15).
- [x] Run `supabase/checks/0003_verify.sql`: all 9 rows ok (2026-10-15).
- [ ] Run `supabase/migrations/0005_bake_photos_ratings.sql` in the SQL editor (visual-round Stage A: rating and photo columns on bakes, the recipe's cover_bake_id, the `recipe_rating()` rule, `shared_recipe()` updated to use it, the one-time rating copy, and the `bake-photos` Storage bucket). Additive — safe to run against the database main and this branch's previews share; doesn't touch anything main's deployed code reads differently.
- [ ] Run `supabase/checks/0005_verify.sql`: all 20 rows should say ok.
- [x] Authentication → Sign-ups off.
- [x] Authentication → Minimum password length 12.
- [x] Authentication → URL Configuration: Site URL `http://localhost:3000`, redirect URL `http://localhost:3000/**` (local for now).
- [x] Reset password email: Supabase's default template (free projects with the built-in email can't edit it). The app sends `redirectTo` = `/auth/confirm` and handles the PKCE code. Branded template later: BACKLOG, custom SMTP.
- [x] Authentication → Users → Add user (owner, your Supabase login email), **Auto Confirm User** ticked.
- [x] `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` (the base address, without `/rest/v1/`), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`).
- [x] Locally on Supabase (`npm run dev:supabase`, 2026-10-01): live anonymous checks pass; signed out → sign in; unknown share link → /r/expired; one sign-in error message; sign in, new recipe, rating and bake survive a reload, share opens read-only in a private window, revoke → "This link no longer works"; reset email → set a new password → Password updated → sign in; the used link is refused by Supabase.

## Before the first deploy

- [x] Rename the branch `master` → `main`.
- [x] Check `gh auth status`, then create the private GitHub repository and push: `NateMS00/nates-bakery`, private (2026-10-01).

## Vercel

- [x] Import the GitHub repository. (The import created no deployment; an empty commit to `main` started the first one.)
- [x] Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (all environments; previews share the Supabase project for now). Not `BACKERY_BACKEND`.
- [x] `APIFY_TOKEN` (server-only, no `NEXT_PUBLIC_` prefix) — `lib/import/apify.ts`'s live caption fetch needs it. Added to Production and Preview, marked Sensitive (2026-10-15).
- [x] `BACKERY_FEATURE_IMPORT=on` — added to Production and Preview (2026-10-15); verified end to end from Nathan's iPhone the same day (`PROGRESS.md`).
- [x] Functions region: Portland (`pdx1`), next to the Supabase project, set in `vercel.json` (applies from the first deploy).
- [x] Deploy: **https://nates-bakery.vercel.app** (2026-10-01). Deployment-specific `…-nate-bcff.vercel.app` addresses sit behind Vercel's login.

## After the first deploy

- [x] **Supabase → URL Configuration: update the Site URL and redirect URLs to the Vercel address** (`https://…vercel.app` and `https://…vercel.app/**`). Reset links come back to `/auth/confirm` on the address that asked; Supabase only allows addresses in this list.
- [x] Smoke check on the live site (2026-10-01): signed out → sign in, `/import` hidden, bad reset code → notice, functions in pdx1, manifest "Nate’s Bakery"/"Nate’s"; signed in: recipe, rating, share read-only ("Shared by Nate"), revoke, password reset through the live address.
- [x] Add to Home Screen on the iPhone (label "Nate’s") — checked, the app icon looks right (2026-10-15).
- [x] Live database tests, anonymous checks (tables denied, `save_recipe` denied, unknown token) pass.
- [x] Live shared-recipe field check (needs `BACKERY_TEST_SHARE_TOKEN`) and live catalog RLS check (needs `BACKERY_TEST_DATABASE_URL`, Session pooler) pass (2026-10-13).

## Keep-alive (free Supabase projects pause after 7 days without activity)

`.github/workflows/supabase-keepalive.yml` runs on GitHub Actions at 09:17 UTC on days 1, 4, 7, … of each month (never more than 3 days apart): one anonymous call to `shared_recipe` with a made-up token, public key only, which returns `null`. Anything but HTTP 200 and `null` fails the run.

- [x] Repo secrets (Settings → Secrets and variables → Actions): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the public values, as in Vercel).
- [x] First run started by hand (Actions → Supabase keep-alive → Run workflow) passes (2026-10-13, HTTP 200 and null).
- Failures: GitHub emails the repo owner about failed scheduled runs (Settings → Notifications → Actions, on by default); run history is under the Actions tab. If Supabase pauses anyway, resume it in the dashboard, then start a run by hand.
