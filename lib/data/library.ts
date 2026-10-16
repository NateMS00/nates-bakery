import { CATEGORIES } from "./categories";
import type { Category, Recipe } from "./types";

// Library query state from SKELETON 1.5.0: ?view=, ?q=, ?category=, ?status=,
// ?rating=. Search and filters combine with the Recipes and Favorites views and
// are ignored on Drafts; invalid values are ignored. The old ?favorite=1 still
// works (BONES-recipes.md: "Opens the Favorites view and rewrites the URL").

export type Status = "all" | "baked" | "not-baked";
export type View = "recipes" | "favorites" | "drafts";

export interface LibraryFilters {
  category: Category | null;
  status: Status;
  /** Minimum rating 1–5, the recipe's displayed rating; unrated recipes only show when this is null. */
  rating: number | null;
}

export interface LibraryQuery extends LibraryFilters {
  q: string;
  /** null when the URL names no view at all (not even the legacy ?favorite=1) — the
   * caller then picks the default (BONES: Drafts when there are no saved recipes, else Recipes). */
  view: View | null;
}

export const NO_FILTERS: LibraryFilters = { category: null, status: "all", rating: null };

type Params = { get(name: string): string | null };

function parseView(params: Params): View | null {
  const view = params.get("view");
  if (view === "recipes" || view === "favorites" || view === "drafts") return view;
  if (params.get("favorite") === "1") return "favorites";
  return null;
}

export function parseLibraryQuery(params: Params): LibraryQuery {
  const category = params.get("category");
  const status = params.get("status");
  const rating = Number(params.get("rating"));
  return {
    q: params.get("q")?.trim() ?? "",
    view: parseView(params),
    category: CATEGORIES.some((c) => c.slug === category) ? (category as Category) : null,
    status: status === "baked" || status === "not-baked" ? status : "all",
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
  };
}

/** Writes filters onto existing params, dropping defaults so URLs stay short. */
export function writeFilters(params: URLSearchParams, f: LibraryFilters): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  const set = (key: string, value: string | null) => (value ? next.set(key, value) : next.delete(key));
  set("category", f.category);
  set("status", f.status === "all" ? null : f.status);
  set("rating", f.rating ? String(f.rating) : null);
  return next;
}

/**
 * Writes ?view= explicitly (never omitted, even for "recipes") and drops the
 * legacy ?favorite=1 (BONES: the redirect rewrites the URL). Explicit on
 * purpose: when there are no saved recipes yet, "recipes" isn't the silent
 * default — "drafts" is — so once the owner actually picks Recipes, the URL
 * has to say so, or a refresh would land back on Drafts.
 */
export function writeView(params: URLSearchParams, view: View): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  next.delete("favorite");
  next.set("view", view);
  return next;
}

export function activeFilterCount(f: LibraryFilters): number {
  return [f.category, f.status !== "all", f.rating].filter(Boolean).length;
}

/** Case- and accent-insensitive: "pasteis" finds "Pastéis". */
function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** `view` governs the base set (all recipes, or favorites only); search and filters narrow it further. Never called for the Drafts view. */
export function matches(recipe: Recipe, query: LibraryQuery): boolean {
  if (query.view === "favorites" && !recipe.favorite) return false;
  if (query.q) {
    const q = fold(query.q);
    const inTitle = fold(recipe.title).includes(q);
    if (!inTitle && !recipe.ingredients.some((i) => fold(i.name).includes(q))) return false;
  }
  if (query.category && recipe.category !== query.category) return false;
  if (query.status === "baked" && recipe.bakeLog.length === 0) return false;
  if (query.status === "not-baked" && recipe.bakeLog.length > 0) return false;
  if (query.rating && (recipe.rating ?? 0) < query.rating) return false;
  return true;
}

/** Most recently baked or added first (SKELETON). */
export function sortRecipes(recipes: Recipe[]): Recipe[] {
  const key = (r: Recipe) => {
    const baked = r.bakeLog[0]?.date ?? "";
    const added = r.createdAt.slice(0, 10);
    return baked > added ? baked : added;
  };
  return [...recipes].sort((a, b) => key(b).localeCompare(key(a)) || a.title.localeCompare(b.title));
}

/** Categories that have recipes, in the fixed order, with counts. */
export function categoryCounts(recipes: Recipe[]): { slug: Category; label: string; count: number }[] {
  return CATEGORIES.map((c) => ({ ...c, count: recipes.filter((r) => r.category === c.slug).length })).filter((c) => c.count > 0);
}

export const RATING_OPTIONS = [
  { value: 3, label: "3★ and up", spoken: "3 stars and up" },
  { value: 4, label: "4★ and up", spoken: "4 stars and up" },
  { value: 5, label: "5★", spoken: "5 stars" },
];

export function ratingLabel(rating: number) {
  return RATING_OPTIONS.find((o) => o.value === rating) ?? { value: rating, label: `${rating}★ and up`, spoken: `${rating} stars and up` };
}
