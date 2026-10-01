# Deploy checklist (phase 1)

Supabase (Postgres + Auth) and Vercel (hosting). Secrets live only in `.env.local` and
in Vercel's environment variables, never in the repo.

## Supabase (project: West US, Oregon)

- [x] Run `supabase/migrations/0001_init.sql` in the SQL editor (2026-10-01).
- [x] Run `supabase/checks/0001_verify.sql`: all 19 rows ok (2026-10-01).
- [ ] Authentication → Sign-ups off.
- [ ] Authentication → Minimum password length 12.
- [ ] Authentication → URL Configuration: Site URL and redirect URLs (local address for now).
- [ ] Authentication → Email Templates → Reset password: link to `/auth/confirm`.
- [ ] Authentication → Users → Add user (owner, your Supabase login email), **Auto Confirm User** ticked.
- [ ] `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`).

## Before the first deploy

- [ ] Rename the branch `master` → `main`.
- [ ] Check `gh auth status`, then create the private GitHub repository and push.

## Vercel

- [ ] Import the GitHub repository.
- [ ] Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production). Not `BACKERY_BACKEND`, not `BACKERY_FEATURE_IMPORT`.
- [ ] Functions region: Portland (`pdx1`), next to the Supabase project.
- [ ] Deploy.

## After the first deploy

- [ ] **Supabase → URL Configuration: update the Site URL and redirect URLs to the Vercel address** (the reset email links use the Site URL).
- [ ] Smoke check on the live site: signed out, every table read is denied; sign in; create a recipe; share it and open `/r/…` in a private window; forgot password → the emailed link → set a new password (works once) → sign in.
- [ ] Run the live database tests: `npx playwright test --config playwright.supabase.config.ts` with the test variables set.
