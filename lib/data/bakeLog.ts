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
