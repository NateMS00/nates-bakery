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

/**
 * "2nd bake", "3rd bake"… — a bake-tile's meta line (BONES-bakes.md): null for the
 * first bake of a recipe, since "1st bake" has nothing to say that the recipe's
 * own first appearance in the diary doesn't already.
 */
export function bakeOrdinalLabel(ordinal: number): string | null {
  if (ordinal < 2) return null;
  const mod100 = ordinal % 100;
  const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : ["th", "st", "nd", "rd"][ordinal % 10] ?? "th";
  return `${ordinal}${suffix} bake`;
}

const ONES = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"];
const TEENS = ["tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const TENS_ORDINAL = ["", "", "twentieth", "thirtieth", "fortieth", "fiftieth", "sixtieth", "seventieth", "eightieth", "ninetieth"];

/** "second", "third"… up to 99 — a bake-row's accessible name ("…, third bake"), spelled out rather than "3rd". */
function ordinalWord(n: number): string {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS_ORDINAL[tens] : `${TENS[tens]}-${ONES[ones]}`;
}

/** "second bake", "third bake"… — null for a recipe's first bake, same rule as `bakeOrdinalLabel`. */
export function bakeOrdinalWord(ordinal: number): string | null {
  return ordinal < 2 ? null : `${ordinalWord(ordinal)} bake`;
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
