import { expect, test } from "@playwright/test";
import { recipeFromRow, sharedFromRow, type RecipeRow, type SharedRow } from "@/lib/backend/supabase/map";
import { fromRecipe, toRecipeContent } from "@/lib/data/editor";
import { RECIPES } from "@/lib/data/fixtures";

// lib/backend/supabase/map.ts: database rows → the app's types, without a database.

const row: RecipeRow = {
  id: "6f1c2a9e-1111-4a2b-9c3d-000000000001",
  title: "Pastéis de nata",
  category: "pastry",
  yield_quantity: 12,
  yield_unit: "tart",
  yield_unit_plural: "tarts",
  total_time_minutes: 210,
  source_creator_handle: "forno.da.rita",
  source_reel_url: "https://www.instagram.com/reel/C9nataRita01/",
  rating: 4,
  favorite: true,
  created_at: "2026-10-01T10:00:00Z",
  // Out of order on purpose: position decides.
  ingredient_groups: [
    { id: "g-custard", name: "Custard", position: 2 },
    { id: "g-pastry", name: "Pastry", position: 1 },
  ],
  step_groups: [],
  ingredients: [
    { id: "i-sugar", group_id: "g-custard", name: "Caster sugar", grams: "250", status: "converted", original: "1¼ cups", position: 2 },
    { id: "i-flour", group_id: "g-pastry", name: "Plain flour", grams: 250, status: "confirmed", original: null, position: 1 },
    { id: "i-cinnamon", group_id: null, name: "Cinnamon stick", grams: null, status: "to-taste", original: null, position: 3 },
  ],
  steps: [
    { id: "s-2", group_id: null, text: "Bake for 12 minutes.", time_marks: [{ text: "12 minutes", minutes: 12 }], position: 2, step_ingredients: [] },
    { id: "s-1", group_id: null, text: "Mix.", time_marks: [], position: 1, step_ingredients: [{ ingredient_id: "i-flour" }] },
  ],
  bakes: [
    { id: "b-old", baked_on: "2026-08-30", scale: "0.5", what_changed: null, how_it_turned_out: null, created_at: "2026-08-30T20:00:00Z" },
    { id: "b-new-1", baked_on: "2026-09-26", scale: 1.5, what_changed: "Hotter oven", how_it_turned_out: null, created_at: "2026-09-26T18:00:00Z" },
    { id: "b-new-2", baked_on: "2026-09-26", scale: 1, what_changed: null, how_it_turned_out: "Better", created_at: "2026-09-26T21:00:00Z" },
  ],
  share_links: { token: "abcdefghijklmnopqrstuvwx", created_at: "2026-09-27T10:12:00Z" },
};

test("a recipe row becomes the app's Recipe, in the owner's order", () => {
  const r = recipeFromRow(row);
  expect(r.ingredientGroups.map((g) => g.id)).toEqual(["g-pastry", "g-custard"]);
  expect(r.ingredients.map((i) => i.id)).toEqual(["i-flour", "i-sugar", "i-cinnamon"]);
  expect(r.ingredients[1]).toEqual({ id: "i-sugar", groupId: "g-custard", name: "Caster sugar", grams: 250, status: "converted", original: "1¼ cups" });
  expect(r.ingredients[2].grams).toBeNull();
  expect(r.steps.map((s) => s.id)).toEqual(["s-1", "s-2"]);
  expect(r.steps[0].ingredientIds).toEqual(["i-flour"]);
  expect(r.steps[1].timeMarks).toEqual([{ text: "12 minutes", minutes: 12 }]);
  expect(r.yield).toEqual({ quantity: 12, unit: "tart", unitPlural: "tarts" });
  expect(r.source).toEqual({ creatorHandle: "forno.da.rita", reelUrl: "https://www.instagram.com/reel/C9nataRita01/" });
  expect(r.shareLink).toEqual({ token: "abcdefghijklmnopqrstuvwx", createdAt: "2026-09-27T10:12:00Z" });
});

test("bakes: newest first, the later-logged one first on the same date; numbers are numbers", () => {
  const r = recipeFromRow(row);
  expect(r.bakeLog.map((b) => b.id)).toEqual(["b-new-2", "b-new-1", "b-old"]);
  expect(r.bakeLog[2]).toEqual({ id: "b-old", date: "2026-08-30", scale: 0.5, whatChanged: undefined, howItTurnedOut: undefined });
});

test("no source, no share link (object, null, or empty array)", () => {
  const manual = recipeFromRow({ ...row, source_creator_handle: null, source_reel_url: null, share_links: null });
  expect(manual.source).toBeUndefined();
  expect(manual.shareLink).toBeNull();
  expect(recipeFromRow({ ...row, share_links: [] }).shareLink).toBeNull();
  expect(recipeFromRow({ ...row, share_links: [{ token: "t".repeat(24), created_at: "x" }] }).shareLink?.token).toBe("t".repeat(24));
});

/** Drops undefined fields (as JSON does when the content is sent to save_recipe). */
const plain = (v: unknown) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

test("the editor's content round-trips to what save_recipe stores", () => {
  // Every fixture recipe: editor state → content (what's sent) has the same shape the
  // row mapping reads back, field for field.
  for (const recipe of RECIPES) {
    const content = toRecipeContent(fromRecipe(recipe));
    const back = recipeFromRow({
      ...row,
      title: content.title,
      category: content.category,
      yield_quantity: content.yield.quantity,
      yield_unit: content.yield.unit,
      yield_unit_plural: content.yield.unitPlural,
      total_time_minutes: content.totalTimeMinutes,
      source_creator_handle: content.source?.creatorHandle ?? null,
      source_reel_url: content.source?.reelUrl ?? null,
      ingredient_groups: content.ingredientGroups.map((g, i) => ({ ...g, position: i + 1 })),
      step_groups: content.stepGroups.map((g, i) => ({ ...g, position: i + 1 })),
      ingredients: content.ingredients.map((i, n) => ({ id: i.id, group_id: i.groupId, name: i.name, grams: i.grams, status: i.status, original: i.original ?? null, position: n + 1 })),
      steps: content.steps.map((s, n) => ({ id: s.id, group_id: s.groupId, text: s.text, time_marks: s.timeMarks, position: n + 1, step_ingredients: s.ingredientIds.map((ingredient_id) => ({ ingredient_id })) })),
    });
    for (const key of ["title", "category", "yield", "totalTimeMinutes", "source", "ingredientGroups", "stepGroups", "ingredients", "steps"] as const) {
      expect(plain(back[key]), `${recipe.id}: ${key}`).toEqual(plain(content[key]));
    }
  }
});

test("a shared row becomes SharedRecipe, signed by the owner, with no step links", () => {
  const shared: SharedRow = {
    title: "Pastéis de nata",
    category: "pastry",
    yield: { quantity: 12, unit: "tart", unitPlural: "tarts" },
    totalTimeMinutes: 210,
    source: null,
    rating: null,
    ingredientGroups: [],
    stepGroups: [],
    ingredients: [{ id: "i-yolks", groupId: null, name: "Egg yolks", grams: 108, status: "estimated" }],
    steps: [{ id: "s-1", groupId: null, text: "Mix.", timeMarks: [] }],
  };
  const r = sharedFromRow(shared);
  expect(r.sharedBy).toBe("Nate");
  expect(r.source).toBeUndefined();
  expect(r.steps[0].ingredientIds).toEqual([]);
  expect(Object.keys(r).sort()).toEqual(["category", "ingredientGroups", "ingredients", "rating", "sharedBy", "source", "stepGroups", "steps", "title", "totalTimeMinutes", "yield"]);
});
