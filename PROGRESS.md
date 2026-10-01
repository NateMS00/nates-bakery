# Progress

Where the build stands, for picking it up again. Updated 2026-09-30.

## Done

Prompts 1–8 from `PROMPTS.md` are built, reviewed, and committed. Each has a Playwright spec in `tests/visual/` that renders it at 390px and 1440px in light and dark; all 400 checks pass.

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

## Next

1. Prompt 9 (accessibility and responsive audit): the audit is done and the trivial fixes are in; the open findings wait for Nathan's decisions (Scale control at tablet width, Watch reel target, Library link names). Re-run with `npx playwright test --config playwright.audit.config.ts`; results land in `audit-results/` (not committed).

## Half-finished and stubbed

Nothing is half-built or uncommitted. These are deliberate stubs until the backend is chosen:

- **Data:** fixtures in server memory (`lib/data/recipes.ts`); changes last until the server restarts. Favorite, rating, bakes, and share links are saved through server actions (`lib/data/actions.ts`), so the Recipe page, Library, and Bake Log agree.
- **Auth:** a cookie-based stub session in `proxy.ts`. The Sign In pages are final, but their actions run on `lib/auth/stub.ts`: sign in as `owner@backery.local` / `backery-owner`; reset "emails" are written to the server log, and any token starting `reset-` works once.
- **Import service:** takes 4.5 seconds and always produces the same Kouign-amann draft; reel ids starting with `Cprivate`, `Cdeleted`, or `Cnorecipe` fail.
- **Timers:** kept in the browser, not on a server, so locked-phone alerts can't be scheduled; no notifications are sent. The chime is synthesized until a real sound is chosen.
- **Placeholders:** the Shortcut install link, reel thumbnails.
- **Owner name** on shared pages ("Shared by Nathan") is a constant in `lib/auth/stub.ts` until accounts exist.
- **Privacy copy** is a draft for Nathan; its promises (password stored only as a hash, no tracking cookies, reels not kept) must hold when the backend is chosen.
- **Fault injection:** the `backery_stub_fail_saves` and `backery_stub_fail_loads` cookies make saves or loads fail, for the error states.

Known issues and follow-ups are in `BACKLOG.md`.

## Running it

Node 20 through nvm (the system Node is 14): `nvm use`, then `npm run dev`. Checks: `npm run typecheck`, `npm run lint`, `npm run build`, then `npx playwright test` (it uses the installed Google Chrome, because Playwright no longer ships Chromium for macOS 12). Screenshots land in `screenshots/`, which isn't committed.
