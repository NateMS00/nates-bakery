import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { isMissing } from "@/lib/data/editor";
import { extractRecipe } from "@/lib/import/extract";
import { toEditorState } from "@/lib/import/toEditorState";

// lib/import/toEditorState.ts: an extracted recipe → the Recipe Editor's form state.
// Run: npx playwright test --config playwright.unit.config.ts

function extracted(name: string) {
  const caption = readFileSync(join(process.cwd(), "tests/fixtures/captions", `${name}.txt`), "utf8");
  const reply = readFileSync(join(process.cwd(), "tests/fixtures/captions", `${name}.round2.json`), "utf8");
  const result = extractRecipe(reply, caption);
  if (result.status !== "ok") throw new Error(`${name}: expected ok, got ${result.status}`);
  return result.recipe;
}

test("toEditorState: tiramisu — grams computed, groups and step links resolved, category suggested", () => {
  const recipe = extracted("tiramisu");
  const { state, unknownNames } = toEditorState(recipe, { reelUrl: "https://www.instagram.com/reel/Ctiramisu/", creatorHandle: "chef.test" });

  expect(state.title).toBe(recipe.title);
  expect(state.category).toBe("dessert");
  expect(state.categorySuggested).toBe(true);
  expect(state.sourceUrl).toBe("https://www.instagram.com/reel/Ctiramisu/");
  expect(state.creatorHandle).toBe("chef.test");

  const yolks = state.ingredients.find((i) => i.name === "egg yolks")!;
  expect(yolks.amount).toBe("168"); // 12 × 14 g, Estimated
  expect(yolks.status).toBe("estimated");

  const coffee = state.ingredients.find((i) => i.name === "moka coffee")!;
  expect(isMissing(coffee)).toBe(true);
  expect(coffee.note).toBe("intense and cold");

  // "uses": ["egg yolks", "sugar"] on the whip step resolves to real ingredient ids
  const whip = state.steps.find((s) => s.text.startsWith("Whip the yolks"))!;
  const sugar = state.ingredients.find((i) => i.name === "sugar")!;
  expect(whip.ingredientIds).toEqual(expect.arrayContaining([yolks.id, sugar.id]));
  expect(whip.ingredientIds).toHaveLength(2);

  // the one named step group, and the trailing Tips group, both became real groups
  expect(state.stepGroups.map((g) => g.name)).toEqual([recipe.stepGroups[0].name, "Tips"]);
  expect(unknownNames).toEqual([]);
});

test("toEditorState: millionaire-shortbread — named ingredient groups, an ingredient with no amount stays Missing", () => {
  const recipe = extracted("millionaire-shortbread");
  const { state } = toEditorState(recipe, { reelUrl: "https://www.instagram.com/reel/Cshortbread/" });

  expect(state.ingredientGroups.map((g) => g.name)).toEqual(["Shortbread Layer", "Caramel Layer", "Chocolate Layer"]);
  const salt = state.ingredients.find((i) => i.name === "flaky sea salt")!;
  expect(isMissing(salt)).toBe(true);
  // every ingredient's groupId points at one of the three real groups
  const groupIds = new Set(state.ingredientGroups.map((g) => g.id));
  for (const i of state.ingredients) expect(groupIds.has(i.groupId!)).toBe(true);
});

test("toEditorState: tres-leches — a plain count converts with no marker, a condensed-milk can is Estimated", () => {
  const recipe = extracted("tres-leches");
  const { state } = toEditorState(recipe, { reelUrl: "https://www.instagram.com/reel/Ctresleches/" });

  const eggs = state.ingredients.find((i) => i.name === "eggs")!;
  expect(eggs.amount).toBe("200"); // 4 × 50 g, a count — Estimated, not a bare metric weight
  expect(eggs.status).toBe("estimated");

  const condensedMilk = state.ingredients.find((i) => i.name === "condensed milk")!;
  expect(condensedMilk.status).toBe("estimated");
  expect(Number(condensedMilk.amount)).toBeGreaterThan(0);
});

test("toEditorState: an unknown ingredient is reported for the grams table to grow", () => {
  const recipe = extracted("milo-brownies");
  const { unknownNames } = toEditorState(recipe, { reelUrl: "https://www.instagram.com/reel/Cmilo/" });
  // "Milo" is measured by the cup here, so it needs a table entry to convert — and
  // has none. A bare "220g" elsewhere never needs one, so it's never "unknown".
  expect(unknownNames.some((n) => n.toLowerCase() === "milo")).toBe(true);
});
