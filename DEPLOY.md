# Deploy checklist (phase 1)

Supabase (Postgres + Auth) and Vercel (hosting). Secrets live only in `.env.local` and
in Vercel's environment variables, never in the repo.

## Supabase (project: West US, Oregon)

- [x] Run `supabase/migrations/0001_init.sql` in the SQL editor (2026-10-01).
- [x] Run `supabase/checks/0001_verify.sql`: all 19 rows ok (2026-10-01).
- [x] Authentication → Sign-ups off.
- [x] Authentication → Minimum password length 12.
- [x] Authentication → URL Configuration: Site URL `http://localhost:3000`, redirect URL `http://localhost:3000/**` (local for now).
- [x] Reset password email: Supabase's default template (free projects with the built-in email can't edit it). The app sends `redirectTo` = `/auth/confirm` and handles the PKCE code. Branded template later: BACKLOG, custom SMTP.
- [x] Authentication → Users → Add user (owner, your Supabase login email), **Auto Confirm User** ticked.
- [x] `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` (the base address, without `/rest/v1/`), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`).
- [x] Locally on Supabase (`npm run dev:supabase`, 2026-10-01): live anonymous checks pass; signed out → sign in; unknown share link → /r/expired; one sign-in error message; sign in, new recipe, rating and bake survive a reload, share opens read-only in a private window, revoke → "This link no longer works"; reset email → set a new password → Password updated → sign in; the used link is refused by Supabase.

## Before the first deploy

- [ ] Rename the branch `master` → `main`.
- [ ] Check `gh auth status`, then create the private GitHub repository and push.

## Vercel

- [ ] Import the GitHub repository.
- [ ] Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production). Not `BACKERY_BACKEND`, not `BACKERY_FEATURE_IMPORT`.
- [ ] Functions region: Portland (`pdx1`), next to the Supabase project.
- [ ] Deploy.

## After the first deploy

- [ ] **Supabase → URL Configuration: update the Site URL and redirect URLs to the Vercel address** (`https://…vercel.app` and `https://…vercel.app/**`). Reset links come back to `/auth/confirm` on the address that asked; Supabase only allows addresses in this list.
- [ ] Smoke check on the live site: signed out, every table read is denied; sign in; create a recipe; share it and open `/r/…` in a private window; forgot password → the emailed link → set a new password (works once) → sign in.
- [ ] Run the live database tests: `npx playwright test --config playwright.supabase.config.ts` with the test variables set.
