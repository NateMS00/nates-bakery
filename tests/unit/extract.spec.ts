import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { dedupeParts, extractRecipe, inCaption, type ExtractedGroup, type ExtractedStep } from "@/lib/import/extract";
import type { AmountPart } from "@/lib/import/grams";

// lib/import/extract.ts: the model's reply (docs/shortcut-prompt.txt) → a recipe the
// app can trust. Round 1 (2026-10-13/14): six real captions run through "Use Model"
// on Nathan's Mac, saved as tests/fixtures/captions/<name>.txt (the caption) and
// <name>.json (the reply, kept exactly as the model wrote it — bugs included, so
// these stay as a regression set once the prompt is fixed and a cleaner round 2 comes
// in). Run: npx playwright test --config playwright.unit.config.ts

const part = (qty: string | null, unit: string): AmountPart => ({ qty, unit });

const load = (name: string, round: "round1" | "round2" | "round3" = "round1") => ({
  caption: readFileSync(join(process.cwd(), "tests/fixtures/captions", `${name}.txt`), "utf8"),
  reply: readFileSync(join(process.cwd(), "tests/fixtures/captions", round === "round1" ? `${name}.json` : `${name}.${round}.json`), "utf8"),
});

function ingredient(groups: ExtractedGroup<{ name: string }>[], name: string) {
  for (const g of groups) {
    const found = (g.items as { name: string }[]).find((i) => i.name === name);
    if (found) return found as unknown as { name: string; amount: string | null; parts: AmountPart[] };
  }
  throw new Error(`no ingredient named "${name}"`);
}

test("dedupeParts: one amount written two ways becomes one part", () => {
  // weight wins when the caption gave one, whichever order the parts arrive in
  expect(dedupeParts([part("1", "cup"), part("227", "g")])).toEqual([part("227", "g")]);
  expect(dedupeParts([part("8", "oz"), part("225", "g")])).toEqual([part("225", "g")]);
  // no weight given: the first form written
  expect(dedupeParts([part("1", "can"), part("14", "oz")])).toEqual([part("1", "can")]);
  // nothing to dedupe
  expect(dedupeParts([])).toEqual([]);
  expect(dedupeParts([part("2", "piece")])).toEqual([part("2", "piece")]);
});

test("dedupeParts: a real combined amount, with no weight anywhere, still adds up", () => {
  // "½ cup + 1 tbsp": two volumes, genuinely added together, not one amount twice
  expect(dedupeParts([part("½", "cup"), part("1", "tbsp")])).toEqual([part("½", "cup"), part("1", "tbsp")]);
  // a count and a can with no weight given: also left alone
  expect(dedupeParts([part("2", "piece"), part("1", "can")])).toEqual([part("2", "piece"), part("1", "can")]);
});

test("inCaption: loose match on case, accents, and spacing", () => {
  const caption = "4 huevos\n120gramos de azúcar\nUna cucharadita de vainilla";
  expect(inCaption("4 huevos", caption)).toBe(true);
  expect(inCaption("4 HUEVOS", caption)).toBe(true);
  expect(inCaption("120gramos de azucar", caption)).toBe(true); // no accent in the check
  expect(inCaption("4 piezas", caption)).toBe(false); // not what the caption says
  expect(inCaption("12 yemas", caption)).toBe(false);
});

test("extractRecipe: reports broken JSON as malformed, not a crash", () => {
  // milo-brownies and tres-leches: a step's "text" key came back broken
  // ({ + tab + ext") — real round-1 failures, kept as-is.
  for (const name of ["milo-brownies", "tres-leches"]) {
    const { caption, reply } = load(name);
    expect(extractRecipe(reply, caption), name).toEqual({ status: "malformed", reason: expect.any(String) });
  }
});

// Round 3 (2026-10-15): a real reply from Nathan's Shortcut in production, against
// milo-brownies' caption, came back "retry" even though it reads as valid JSON.
// Reproducing it directly (same reply text, same caption) parses fine — ruling out
// the reply's content (nothing here is actually malformed) and pointing instead at
// something in how the Shortcut's JSON body carries the reply. Kept as a regression
// fixture either way, plus a defensive fix (tolerate a markdown code fence) that's a
// plausible real-world cause and costs nothing if it isn't this one.

test("extractRecipe: round 3 — milo-brownies' real production reply parses ok", () => {
  const { caption, reply } = load("milo-brownies", "round3");
  const result = extractRecipe(reply, caption);
  expect(result.status).toBe("ok");
  if (result.status !== "ok") return;
  expect(result.recipe.title).toBe("Brownies of Milo");
  expect(result.recipe.ingredientGroups[0].items).toHaveLength(8);
  const tips = result.recipe.stepGroups.find((g) => g.name === "Tips");
  expect(tips?.items).toHaveLength(3);
});

test("extractRecipe: tolerates a reply wrapped in a markdown code fence", () => {
  const { caption, reply } = load("milo-brownies", "round3");
  const fenced = "```json\n" + reply + "\n```";
  expect(extractRecipe(fenced, caption)).toEqual(extractRecipe(reply, caption));
});

test("extractRecipe: no recipe, and extra or duplicated keys are ignored", () => {
  expect(extractRecipe('{"recipe": false}', "no recipe here")).toEqual({ status: "no-recipe" });

  // guava-cheesecake's reply has a duplicated top-level "steps" alongside "stepGroups".
  const { caption, reply } = load("guava-cheesecake");
  const result = extractRecipe(reply, caption);
  expect(result.status).toBe("ok");
  if (result.status === "ok") {
    expect(result.recipe.stepGroups).toHaveLength(1);
    expect(result.recipe.stepGroups[0].items).toHaveLength(3);
  }
});

test("extractRecipe: millionaire-shortbread — every two-way amount collapses, the empty step group drops", () => {
  const { caption, reply } = load("millionaire-shortbread");
  const result = extractRecipe(reply, caption);
  expect(result.status).toBe("ok");
  if (result.status !== "ok") return;

  expect(ingredient(result.recipe.ingredientGroups, "unsalted butter, softened").parts).toEqual([part("227", "g")]);
  expect(ingredient(result.recipe.ingredientGroups, "semisweet chocolate, chopped (or chips)").parts).toEqual([part("225", "g")]);
  // "1 (14 oz) can": no weight given, so the first form (the can) wins
  expect(ingredient(result.recipe.ingredientGroups, "sweetened condensed milk").parts).toEqual([part("1", "can")]);

  // the reply's one stepGroup has no steps at all — dropped rather than kept empty
  expect(result.recipe.stepGroups).toHaveLength(0);
});

test("extractRecipe: tiramisu — empty example groups drop, an untrustworthy amount is dropped but its grams survive, extra keys don't block it", () => {
  const { caption, reply } = load("tiramisu");
  const result = extractRecipe(reply, caption);
  expect(result.status).toBe("ok"); // despite the reply's stray "recipe": true
  if (result.status !== "ok") return;

  // Dough, Filling, and Topping came back empty (copied from the prompt's own
  // example) alongside the real, populated group — only the real one survives.
  expect(result.recipe.ingredientGroups).toHaveLength(1);

  // the caption says "12 yemas de huevo", never "12 piezas" — so the model's
  // "amount" text is dropped, but the parts it read (for grams) are kept.
  const yolks = ingredient(result.recipe.ingredientGroups, "egg yolks");
  expect(yolks.amount).toBeNull();
  expect(yolks.parts).toEqual([part("12", "piece")]);
});

test("extractRecipe: triple-chocolate-tart — a full, clean reply with four groups parses as-is", () => {
  const { caption, reply } = load("triple-chocolate-tart");
  const result = extractRecipe(reply, caption);
  expect(result.status).toBe("ok");
  if (result.status !== "ok") return;
  expect(result.recipe.ingredientGroups).toHaveLength(4);
  expect(result.recipe.stepGroups).toHaveLength(4);
});

test("extractRecipe: a trailing step group named Tips is kept last, wherever the model put it", () => {
  const reply = JSON.stringify({
    ingredientGroups: [{ name: null, items: [{ name: "flour", amount: "1 cup", parts: [part("1", "cup")], note: null }] }],
    stepGroups: [
      { name: "Tips", steps: [{ text: "Keeps for three days.", uses: [] }] },
      { name: "Baking", steps: [{ text: "Bake for 30 minutes.", uses: [] }] },
    ],
  });
  const result = extractRecipe(reply, "1 cup flour. Bake for 30 minutes. Keeps for three days.");
  expect(result.status).toBe("ok");
  if (result.status !== "ok") return;
  const names = result.recipe.stepGroups.map((g: ExtractedGroup<ExtractedStep>) => g.name);
  expect(names).toEqual(["Baking", "Tips"]);
});

// Round 2 (2026-10-14): same six captions, rerun through "Recipe test" (the Shortcut
// driving "Use Model", called directly via `shortcuts run`) after the prompt fix.
// None of these need dedupeParts or inCaption to rewrite anything anymore — the
// model stopped making those particular mistakes once the prompt asked it not to —
// but the extractor is still what guarantees that, not the prompt by itself.

test("extractRecipe: round 2 — all six captions parse as ok", () => {
  for (const name of ["guava-cheesecake", "millionaire-shortbread", "milo-brownies", "tiramisu", "tres-leches", "triple-chocolate-tart"]) {
    const { caption, reply } = load(name, "round2");
    expect(extractRecipe(reply, caption), name).toMatchObject({ status: "ok" });
  }
});

test("extractRecipe: round 2 — millionaire-shortbread's two-way amounts now arrive as a single part already", () => {
  const { caption, reply } = load("millionaire-shortbread", "round2");
  const result = extractRecipe(reply, caption);
  expect(result.status).toBe("ok");
  if (result.status !== "ok") return;
  expect(ingredient(result.recipe.ingredientGroups, "unsalted butter, softened").parts).toEqual([part("227", "g")]);
  // "1 (14 oz) can": no weight given, so the model's choice of which single form to
  // keep ("1 can" or "14 oz") varies run to run — either is correct, just not both
  const condensedMilk = ingredient(result.recipe.ingredientGroups, "sweetened condensed milk").parts;
  expect(condensedMilk).toHaveLength(1);
  expect(["can", "oz"]).toContain(condensedMilk[0].unit);
  // the language is no longer mistagged "Spanish" for an English caption
  expect(result.recipe.language).toBe("English");
});

test("extractRecipe: round 2 — tres-leches' tip is translated with no leftover \"CONSEJO:\" label", () => {
  const { caption, reply } = load("tres-leches", "round2");
  const result = extractRecipe(reply, caption);
  expect(result.status).toBe("ok");
  if (result.status !== "ok") return;
  const tips = result.recipe.stepGroups.find((g) => g.name === "Tips");
  expect(tips?.items).toHaveLength(1);
  expect(tips?.items[0].text).not.toMatch(/consejo/i);
});

test("extractRecipe: round 2 — tiramisu keeps each step's full instruction, not just its numbered heading", () => {
  const { caption, reply } = load("tiramisu", "round2");
  const result = extractRecipe(reply, caption);
  expect(result.status).toBe("ok");
  if (result.status !== "ok") return;
  const main = result.recipe.stepGroups.find((g) => g.name !== "Tips");
  const whipped = main?.items.find((s) => s.text.startsWith("Whip the yolks"));
  expect(whipped?.text).toContain("3-4 minutes");
});
