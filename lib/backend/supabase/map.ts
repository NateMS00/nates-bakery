import { OWNER_NAME } from "@/lib/auth/rules";
import type { BakeLogEntry, Recipe, SharedRecipe } from "@/lib/data/types";

// Database rows ↔ the app's types (lib/data/types.ts). Pure, so tests/supabase can
// check it without a database.

/** The columns and parts read for a recipe (PostgREST select). */
export const RECIPE_SELECT = `
  id, title, category, yield_quantity, yield_unit, yield_unit_plural, total_time_minutes,
  source_creator_handle, source_reel_url, rating, favorite, created_at,
  ingredient_groups ( id, name, position ),
  step_groups ( id, name, position ),
  ingredients ( id, group_id, name, grams, status, original, note, position ),
  steps ( id, group_id, text, time_marks, position, step_ingredients ( ingredient_id ) ),
  bakes ( id, baked_on, scale, what_changed, how_it_turned_out, created_at ),
  share_links ( token, created_at )
`;

interface GroupRow { id: string; name: string; position: number }
interface IngredientRow { id: string; group_id: string | null; name: string; grams: number | string | null; status: Recipe["ingredients"][number]["status"]; original: string | null; note: string | null; position: number }
interface StepRow { id: string; group_id: string | null; text: string; time_marks: { text: string; minutes: number }[]; position: number; step_ingredients: { ingredient_id: string }[] }
export interface BakeRow { id: string; baked_on: string; scale: number | string; what_changed: string | null; how_it_turned_out: string | null; created_at: string }
interface ShareRow { token: string; created_at: string }

export interface RecipeRow {
  id: string;
  title: string;
  category: Recipe["category"];
  yield_quantity: number;
  yield_unit: string;
  yield_unit_plural: string;
  total_time_minutes: number;
  source_creator_handle: string | null;
  source_reel_url: string | null;
  rating: number | null;
  favorite: boolean;
  created_at: string;
  ingredient_groups: GroupRow[];
  step_groups: GroupRow[];
  ingredients: IngredientRow[];
  steps: StepRow[];
  bakes: BakeRow[];
  /** One-to-one: PostgREST returns an object (or null); an array is accepted too. */
  share_links: ShareRow | ShareRow[] | null;
}

const byPosition = <T extends { position: number }>(rows: T[]) => [...rows].sort((a, b) => a.position - b.position);
const num = (v: number | string | null) => (v === null ? null : Number(v));

export function bakeFromRow(b: BakeRow): BakeLogEntry {
  return {
    id: b.id,
    date: b.baked_on,
    scale: Number(b.scale),
    whatChanged: b.what_changed ?? undefined,
    howItTurnedOut: b.how_it_turned_out ?? undefined,
  };
}

/** Newest first; on the same date, the bake logged later first (as lib/data/bakeLog.ts). */
function sortBakes(rows: BakeRow[]): BakeRow[] {
  return [...rows].sort((a, b) => b.baked_on.localeCompare(a.baked_on) || b.created_at.localeCompare(a.created_at));
}

export function recipeFromRow(r: RecipeRow): Recipe {
  const share = Array.isArray(r.share_links) ? (r.share_links[0] ?? null) : r.share_links;
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    yield: { quantity: r.yield_quantity, unit: r.yield_unit, unitPlural: r.yield_unit_plural },
    totalTimeMinutes: r.total_time_minutes,
    source: r.source_reel_url ? { creatorHandle: r.source_creator_handle ?? "", reelUrl: r.source_reel_url } : undefined,
    ingredientGroups: byPosition(r.ingredient_groups).map(({ id, name }) => ({ id, name })),
    stepGroups: byPosition(r.step_groups).map(({ id, name }) => ({ id, name })),
    ingredients: byPosition(r.ingredients).map((i) => ({
      id: i.id,
      groupId: i.group_id,
      name: i.name,
      grams: num(i.grams),
      status: i.status,
      original: i.original ?? undefined,
      note: i.note ?? undefined,
    })),
    steps: byPosition(r.steps).map((s) => ({
      id: s.id,
      groupId: s.group_id,
      text: s.text,
      timeMarks: s.time_marks.map((m) => ({ text: m.text, minutes: Number(m.minutes) })),
      ingredientIds: s.step_ingredients.map((x) => x.ingredient_id),
    })),
    rating: r.rating,
    favorite: r.favorite,
    bakeLog: sortBakes(r.bakes).map(bakeFromRow),
    shareLink: share ? { token: share.token, createdAt: share.created_at } : null,
    createdAt: r.created_at,
  };
}

/** What public.shared_recipe returns (supabase/migrations/0001_init.sql). */
export interface SharedRow {
  title: string;
  category: Recipe["category"];
  yield: { quantity: number; unit: string; unitPlural: string };
  totalTimeMinutes: number;
  source: { creatorHandle: string; reelUrl: string } | null;
  rating: number | null;
  ingredientGroups: { id: string; name: string }[];
  stepGroups: { id: string; name: string }[];
  ingredients: { id: string; groupId: string | null; name: string; grams: number | null; status: Recipe["ingredients"][number]["status"] }[];
  steps: { id: string; groupId: string | null; text: string; timeMarks: { text: string; minutes: number }[] }[];
}

export function sharedFromRow(s: SharedRow): SharedRecipe {
  return {
    title: s.title,
    category: s.category,
    yield: s.yield,
    totalTimeMinutes: s.totalTimeMinutes,
    source: s.source ?? undefined,
    rating: s.rating,
    ingredientGroups: s.ingredientGroups,
    stepGroups: s.stepGroups,
    ingredients: s.ingredients.map((i) => ({ ...i, grams: num(i.grams) })),
    // Which ingredients a step uses isn't shared; the page doesn't need it.
    steps: s.steps.map((st) => ({ ...st, ingredientIds: [] })),
    sharedBy: OWNER_NAME,
  };
}
