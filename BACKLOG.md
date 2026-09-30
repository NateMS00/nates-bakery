# Backlog

Known issues and follow-ups that aren't part of the current prompt.

- **Not-found returns HTTP 200 for unknown `:recipeId`.** The Recipe route streams its Loading state (`loading.tsx`) before the page knows the recipe is missing, so the status is already sent when `notFound()` runs. The not-found content still renders. Revisit with the backend: check existence before streaming (for example in `proxy.ts` or a layout), or drop the route-level loading boundary. Accepted for now (2026-09-29).
- **Library: Show more doesn't remember how many recipes were loaded.** After opening a recipe and coming back, the list starts again at 30. Keep the count (for example in session storage or history state, keyed by the query) so the position survives going back, as BONES-recipes intends. Logged 2026-09-30.
