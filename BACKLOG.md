# Backlog

Known issues and follow-ups that aren't part of the current prompt.

- **Not-found returns HTTP 200 for unknown `:recipeId`.** The Recipe route streams its Loading state (`loading.tsx`) before the page knows the recipe is missing, so the status is already sent when `notFound()` runs. The not-found content still renders. Revisit with the backend: check existence before streaming (for example in `proxy.ts` or a layout), or drop the route-level loading boundary. Accepted for now (2026-09-29).
- **Library: Show more doesn't remember how many recipes were loaded.** After opening a recipe and coming back, the list starts again at 30. Keep the count (for example in session storage or history state, keyed by the query) so the position survives going back, as BONES-recipes intends. Logged 2026-09-30.
- **New and Edit Recipe: the leave check doesn't catch the browser's Back button.** In-app links and closing or reloading the tab ask first, but Back leaves without asking and loses unsaved work. Review Import is safe because it autosaves. Needs a history guard (for example a pushed history entry and a popstate handler) or autosaving drafts on New and Edit too. Logged 2026-09-30.
- **Bake Mode: continue where you left off.** Moving between steps replaces the URL (Back leaves Bake Mode, by design), so re-entering starts at step 1. Remember the last step per recipe and offer "Continue from step n" on re-entry. Logged 2026-09-30.
- **Link preview for shared recipes.** When a share link is pasted in a message, show an Open Graph preview: the recipe title, "Shared by Nathan", and a tile-pattern image. Only what the shared page already shows, nothing private (no bake log, favorite, or notes). Logged 2026-09-30.
