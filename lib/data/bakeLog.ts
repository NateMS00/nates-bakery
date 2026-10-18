import type { BakeLogEntry } from "./types";

/** Newest first by date; on the same date, the entry earlier in the list stays first. */
export function sortLog(entries: BakeLogEntry[]): BakeLogEntry[] {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.date.localeCompare(a.e.date) || a.i - b.i)
    .map(({ e }) => e);
}

/**
 * The one rule for "this recipe's displayed rating" (SKELETON 1.5.0, Nathan
 * 2026-10-15): the latest bake with a rating, else the recipe's own legacy
 * rating. `bakeLog` must already be sorted newest-first (sortLog's order), same
 * as every Recipe's bakeLog. The fixtures backend's equivalent of Supabase's
 * `recipe_rating()` SQL function (supabase/migrations/0005_bake_photos_ratings.sql)
 * — the two must stay in agreement; nothing else should recompute this rule.
 */
export function deriveRecipeRating(recipe: { rating: number | null; bakeLog: BakeLogEntry[] }): number | null {
  return recipe.bakeLog.find((e) => e.rating !== null)?.rating ?? recipe.rating;
}

/** "1 bake", "5 bakes". */
export function bakeCount(n: number): string {
  return n === 1 ? "1 bake" : `${n} bakes`;
}

export type Milestone = { kind: "first" } | { kind: "best" } | { kind: "nth"; n: number };

/**
 * After-save milestone check (BONES-recipes-log.md, Nathan 2026-10-16, corrected
 * 2026-10-16): one per save, in priority order —
 * - first: the recipe's first bake ever (not the baker's first bake overall).
 * - best: `newEntry`'s rating is higher than every *earlier rated* bake of this
 *   recipe. A first-ever rating doesn't count (nothing earlier to beat), so it
 *   never makes every recipe's first rating a "best".
 * - nth: every 5th bake of this recipe (5, 10, 15…), by total count including
 *   `newEntry`.
 * `allEntries` must already include `newEntry` (sortLog's order, any order is
 * fine here since only counts and a max are taken).
 */
export function detectMilestone(allEntries: BakeLogEntry[], newEntry: BakeLogEntry): Milestone | null {
  if (allEntries.length === 1) return { kind: "first" };

  const earlierRated = allEntries.filter((e) => e.id !== newEntry.id && e.rating !== null);
  if (newEntry.rating !== null && earlierRated.length > 0 && newEntry.rating > Math.max(...earlierRated.map((e) => e.rating!))) {
    return { kind: "best" };
  }

  if (allEntries.length % 5 === 0) return { kind: "nth", n: allEntries.length };

  return null;
}
