# Progress

Where the build stands, for picking it up again. Updated 2026-09-30.

## Done

Prompts 1–5 from `PROMPTS.md` are built, reviewed, and committed. Each has a Playwright spec in `tests/visual/` that renders it at 390px and 1440px in light and dark; all 272 checks pass.

| Prompt | Route | Commits |
|---|---|---|
| 1. Theme, shell, Recipe page | `/recipes/:recipeId` | `b78f597`, review fixes `63926d0` |
| 2. Library | `/recipes` | `66b611c`, review fixes `d0fc51a` |
| 3. Review Import and the recipe editor | `/import/:draftId`, `/recipes/new`, `/recipes/:recipeId/edit` | `4463c4c`, review fixes `d1fdebc`, `b17c01e` |
| 4. Import | `/import` | `c8530ee`, review fixes `0216013` |
| 5. Bake Mode | `/recipes/:recipeId/bake` | `38dae5b`, review fixes `bcf1c5a` |

Also in place across the app: the theme generated from `SKIN.md` (`npm run theme`), self-hosted fonts, the App and Focus shells, SKIN's page top, the overlay sizing rule, and the shared destructive-confirmation dialog.

## Next

1. **Sort timers by time remaining** in Bake Mode, soonest to finish first (the mobile strip and the desktop Timers panel). Not started.
2. **Prompt 6: Bake Log** (`/recipes/:recipeId/log`). Bake Mode's Finish already goes to `/recipes/:recipeId/log?new=1&scale=`, and the Recipe page links to the log; both show not-found until it's built.
3. Then prompts 7 (Shared recipe), 8 (auth and system pages), and 9 (accessibility audit).

## Half-finished and stubbed

Nothing is half-built or uncommitted. These are deliberate stubs until the backend is chosen:

- **Data:** fixtures in server memory (`lib/data/recipes.ts`); changes last until the server restarts. Favorite, rating, and bakes set on the Recipe page are client-side only for now.
- **Auth:** a cookie-based stub session in `proxy.ts`, with a placeholder `/login` ("Continue as owner").
- **Import service:** takes 4.5 seconds and always produces the same Kouign-amann draft; reel ids starting with `Cprivate`, `Cdeleted`, or `Cnorecipe` fail.
- **Timers:** kept in the browser, not on a server, so locked-phone alerts can't be scheduled; no notifications are sent. The chime is synthesized until a real sound is chosen.
- **Placeholders:** the Shortcut install link, reel thumbnails.
- **Not built yet:** `/privacy`, `/login` (real), `/forgot-password`, `/reset-password`, `/r/:shareToken`, `/r/expired`, and the final not-found and error pages (prompts 7–8).

Known issues and follow-ups are in `BACKLOG.md`.

## Running it

Node 20 through nvm (the system Node is 14): `nvm use`, then `npm run dev`. Checks: `npm run typecheck`, `npm run lint`, `npm run build`, then `npx playwright test` (it uses the installed Google Chrome, because Playwright no longer ships Chromium for macOS 12). Screenshots land in `screenshots/`, which isn't committed.
