import { CATEGORIES } from "./categories";
import type { Category, Recipe } from "./types";

// Library query state from SKELETON: ?q=, ?category=, ?status=, ?favorite=1, ?rating=.
// All combine; invalid values are ignored.

export type Status = "all" | "baked" | "not-baked";

export interface LibraryFilters {
  category: Category | null;
  status: Status;
  favorite: boolean;
  /** Minimum rating 1–5; unrated recipes only show when this is null. */
  rating: number | null;
}

export interface LibraryQuery extends LibraryFilters {
  q: string;
}

export const NO_FILTERS: LibraryFilters = { category: null, status: "all", favorite: false, rating: null };

type Params = { get(name: string): string | null };

export function parseLibraryQuery(params: Params): LibraryQuery {
  const category = params.get("category");
  const status = params.get("status");
  const rating = Number(params.get("rating"));
  return {
    q: params.get("q")?.trim() ?? "",
    category: CATEGORIES.some((c) => c.slug === category) ? (category as Category) : null,
    status: status === "baked" || status === "not-baked" ? status : "all",
    favorite: params.get("favorite") === "1",
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
  };
}

/** Writes filters onto existing params, dropping defaults so URLs stay short. */
export function writeFilters(params: URLSearchParams, f: LibraryFilters): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  const set = (key: string, value: string | null) => (value ? next.set(key, value) : next.delete(key));
  set("category", f.category);
  set("status", f.status === "all" ? null : f.status);
  set("favorite", f.favorite ? "1" : null);
  set("rating", f.rating ? String(f.rating) : null);
  return next;
}

export function activeFilterCount(f: LibraryFilters): number {
  return [f.category, f.status !== "all", f.favorite, f.rating].filter(Boolean).length;
}

/** Case- and accent-insensitive: "pasteis" finds "Pastéis". */
function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function matches(recipe: Recipe, query: LibraryQuery): boolean {
  if (query.q) {
    const q = fold(query.q);
    const inTitle = fold(recipe.title).includes(q);
    if (!inTitle && !recipe.ingredients.some((i) => fold(i.name).includes(q))) return false;
  }
  if (query.category && recipe.category !== query.category) return false;
  if (query.status === "baked" && recipe.bakeLog.length === 0) return false;
  if (query.status === "not-baked" && recipe.bakeLog.length > 0) return false;
  if (query.favorite && !recipe.favorite) return false;
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
