import { expect, test } from "@playwright/test";
import { TABLE, findEntry, roundGrams, toGrams, words, type AmountPart } from "@/lib/import/grams";
import { parseQuantity } from "@/lib/import/quantity";

// lib/import/quantity.ts and lib/import/grams.ts: amounts as written in a caption →
// grams and their marker (SKELETON 1.4.2 FLOW-01 step 4, BONES-import-detail 1.4.1).
// Run: npx playwright test --config playwright.unit.config.ts

const one = (name: string, amount: string | null, ...parts: [string | null, string][]) =>
  toGrams({ name, amount, parts: parts.map(([qty, unit]): AmountPart => ({ qty, unit })) });

test("quantities as written", () => {
  const cases: [string | null, number | null][] = [
    ["1", 1],
    ["12", 12],
    ["½", 0.5],
    ["¾", 0.75],
    ["⅓", 1 / 3],
    ["2 ½", 2.5],
    ["2½", 2.5],
    ["1 1/2", 1.5],
    ["1-1/2", 1.5],
    ["3/4", 0.75],
    ["1⁄2", 0.5], // fraction slash
    ["2,5", 2.5],
    ["0.75", 0.75],
    ["2-3", 2],
    ["2 – 3", 2],
    ["2 to 3", 2],
    ["2 a 3", 2],
    ["1 1/2-2", 1.5],
    ["a", 1],
    ["una", 1],
    ["medio", 0.5],
    ["half", 0.5],
    ["0", null],
    ["", null],
    [null, null],
    ["some", null],
    ["1/0", null],
  ];
  for (const [qty, expected] of cases) {
    const n = parseQuantity(qty);
    if (expected === null) expect(n, String(qty)).toBeNull();
    else expect(n, String(qty)).toBeCloseTo(expected, 6);
  }
});

test("ingredient names match whole entries only, whatever the descriptors or order", () => {
  const same = (name: string, as: string) => expect(findEntry(name), `${name} → ${as}`).toBe(findEntry(as));
  same("Unsalted butter, softened", "butter");
  same("butter (room temperature)", "butter");
  same("packed light brown sugar", "brown sugar");
  same("Sugar, brown", "brown sugar");
  same("All-purpose flour, sifted", "flour");
  same("plain flour", "flour");
  same("confectioners' sugar", "powdered sugar");
  same("Large eggs", "egg");
  same("Egg yolks", "egg yolk");
  same("egg whites, at room temperature", "egg white");
  same("pure vanilla extract", "vanilla extract");
  same("Old-fashioned rolled oats", "rolled oat");
  same("chopped walnuts", "walnut");
  same("Cream cheese, softened", "cream cheese");
  same("Heavy cream, cold", "heavy cream");
  // Different words, a different entry: never a partial match.
  expect(findEntry("whole wheat flour")).not.toBe(findEntry("flour"));
  expect(findEntry("sour cream")).not.toBe(findEntry("cream"));
  expect(findEntry("peanut butter")).not.toBe(findEntry("butter"));
  expect(findEntry("egg white")).not.toBe(findEntry("egg"));
  for (const unknown of ["rice flour", "eggplant", "buttermilk", "dark chocolate", "lemon zest", "ice cream", "brown butter sauce", ""]) {
    expect(findEntry(unknown), unknown).toBeNull();
  }
  expect(words("Crème fraîche (cold)")).toEqual(["creme", "fraiche"]);
});

test("the table matches King Arthur's ingredient weight chart (fetched 2026-10-13)", () => {
  // [ingredient, qty, unit, grams in King Arthur's chart]
  const rows: [string, string, string, number][] = [
    ["all-purpose flour", "1", "cup", 120],
    ["bread flour", "1", "cup", 120],
    ["whole wheat flour", "1", "cup", 113],
    ["cake flour", "1", "cup", 120],
    ["almond flour", "1", "cup", 96],
    ["cocoa powder", "1/2", "cup", 42],
    ["cornstarch", "1/4", "cup", 28],
    ["granulated sugar", "1", "cup", 198],
    ["brown sugar", "1", "cup", 213],
    ["confectioners' sugar", "1", "cup", 113],
    ["butter", "8", "tbsp", 113],
    ["butter", "1/2", "cup", 113],
    ["vegetable oil", "1", "cup", 198],
    ["milk", "1", "cup", 227],
    ["heavy cream", "1", "cup", 227],
    ["water", "1", "cup", 227],
    ["sour cream", "1", "cup", 227],
    ["yogurt", "1", "cup", 227],
    ["cream cheese", "1", "cup", 227],
    ["honey", "1", "tbsp", 21],
    ["maple syrup", "1/2", "cup", 156],
    ["corn syrup", "1", "cup", 312],
    ["molasses", "1/4", "cup", 85],
    ["sweetened condensed milk", "1/4", "cup", 78],
    ["evaporated milk", "1/2", "cup", 113],
    ["peanut butter", "1/2", "cup", 135],
    ["old-fashioned oats", "1", "cup", 89],
    ["chocolate chips", "1", "cup", 170],
    ["chopped walnuts", "1", "cup", 113],
    ["diced pecans", "1/2", "cup", 57],
    ["sweetened shredded coconut", "1", "cup", 85],
    ["unsweetened shredded coconut", "1", "cup", 53],
    ["cornmeal", "1", "cup", 156],
    ["table salt", "1", "tbsp", 18],
    ["baking powder", "1", "tsp", 4],
    ["baking soda", "1/2", "tsp", 3],
    ["instant yeast", "2 1/4", "tsp", 7],
    ["vanilla extract", "1", "tbsp", 14],
  ];
  for (const [name, qty, unit, grams] of rows) {
    const c = one(name, `${qty} ${unit}`, [qty, unit]);
    expect(c, `${qty} ${unit} ${name}`).toEqual({ status: "converted", grams, original: `${qty} ${unit}` });
  }
  for (const [name, grams] of [["egg", 50], ["egg yolk", 14], ["egg white", 32]] as const) {
    expect(one(name, "1", ["1", "piece"])).toEqual({ status: "estimated", grams, original: "1" });
  }
});

test("metric weights are taken as given, with no marker", () => {
  expect(one("flour", "250 g", ["250", "g"])).toEqual({ status: "confirmed", grams: 250 });
  expect(one("flour", "1 kg", ["1", "kg"])).toEqual({ status: "confirmed", grams: 1000 });
  expect(one("saffron", "500 mg", ["500", "mg"])).toEqual({ status: "confirmed", grams: 0.5 }); // not in the table: grams need no table
  expect(one("salt", "3,5 g", ["3,5", "g"])).toEqual({ status: "confirmed", grams: 3.5 });
});

test("volumes and imperial weights are Converted, with the amount as written", () => {
  expect(one("all-purpose flour", "2 ½ tazas", ["2 ½", "cup"])).toEqual({ status: "converted", grams: 300, original: "2 ½ tazas" });
  // ½ cup + 1 tbsp of packed brown sugar: 106.5 + 13.3
  expect(one("packed light brown sugar", "½ taza + 1 cda", ["½", "cup"], ["1", "tbsp"])).toEqual({ status: "converted", grams: 120, original: "½ taza + 1 cda" });
  expect(one("milk", "250 ml", ["250", "ml"])).toEqual({ status: "converted", grams: 258, original: "250 ml" });
  expect(one("water", "250 ml", ["250", "ml"])).toEqual({ status: "converted", grams: 250, original: "250 ml" });
  expect(one("heavy cream", "1 l", ["1", "l"])).toEqual({ status: "converted", grams: 1000, original: "1 l" });
  expect(one("honey", "60 ml", ["60", "ml"])).toEqual({ status: "converted", grams: 85, original: "60 ml" }); // from the cup weight
  expect(one("ground cinnamon", "1 cdta", ["1", "tsp"])).toEqual({ status: "converted", grams: 2.6, original: "1 cdta" });
  expect(one("butter", "4 oz", ["4", "oz"])).toEqual({ status: "converted", grams: 113, original: "4 oz" });
  expect(one("flour", "1 lb", ["1", "lb"])).toEqual({ status: "converted", grams: 454, original: "1 lb" });
  expect(one("milk", "8 fl oz", ["8", "fl_oz"])).toEqual({ status: "converted", grams: 227, original: "8 fl oz" });
  // Grams plus a volume: Converted, since part of it was.
  expect(one("sugar", "100 g + 2 tbsp", ["100", "g"], ["2", "tbsp"])).toEqual({ status: "converted", grams: 125, original: "100 g + 2 tbsp" });
});

test("counts, packages, and a pinch are Estimated at a typical weight", () => {
  expect(one("egg", "2 huevos", ["2", "piece"])).toEqual({ status: "estimated", grams: 100, original: "2 huevos" });
  expect(one("egg yolks", "6 gemas", ["6", "piece"])).toEqual({ status: "estimated", grams: 84, original: "6 gemas" });
  expect(one("unsalted butter", "1 barra", ["1", "stick"])).toEqual({ status: "estimated", grams: 113, original: "1 barra" });
  expect(one("sweetened condensed milk", "1 lata", ["1", "can"])).toEqual({ status: "estimated", grams: 395, original: "1 lata" });
  expect(one("evaporated milk", "1 can", ["1", "can"])).toEqual({ status: "estimated", grams: 354, original: "1 can" });
  expect(one("instant yeast", "1 sobre", ["1", "packet"])).toEqual({ status: "estimated", grams: 7, original: "1 sobre" });
  expect(one("salt", "una pizca", ["una", "pinch"])).toEqual({ status: "estimated", grams: 0.5, original: "una pizca" });
  expect(one("salt", "a pinch", [null, "pinch"])).toEqual({ status: "estimated", grams: 0.5, original: "a pinch" });
  // A range converts from its first number; the range stays visible.
  expect(one("eggs", "2-3 eggs", ["2-3", "piece"])).toEqual({ status: "estimated", grams: 100, original: "2-3 eggs" });
  // Butter in tablespoons is a volume (Converted), not a package.
  expect(one("butter", "2 tbsp", ["2", "tbsp"])).toEqual({ status: "converted", grams: 28, original: "2 tbsp" });
});

test("to taste, and no amount", () => {
  expect(one("salt", "al gusto", [null, "to_taste"])).toEqual({ status: "to-taste" });
  expect(one("flaky salt", null)).toEqual({ status: "missing" });
  expect(one("caramel sauce", "", )).toEqual({ status: "missing" });
});

test("unknown ingredients or units are Missing, keep the amount, and are flagged for the log", () => {
  expect(one("rice flour", "½ taza", ["½", "cup"])).toEqual({ status: "missing", original: "½ taza", unknown: true });
  expect(one("eggplant", "1", ["1", "piece"])).toEqual({ status: "missing", original: "1", unknown: true });
  expect(one("cinnamon stick", "1 rama", ["1", "piece"])).toEqual({ status: "missing", original: "1 rama", unknown: true });
  expect(one("flour", "1 puñado", ["1", "other"])).toEqual({ status: "missing", original: "1 puñado", unknown: true });
  expect(one("flour", "1 handful", ["1", "handful"])).toEqual({ status: "missing", original: "1 handful", unknown: true });
  expect(one("butter", "1 can", ["1", "can"])).toEqual({ status: "missing", original: "1 can", unknown: true }); // no can size for butter
  // Known, but too different by brand to convert: Missing, not logged as unknown.
  expect(one("kosher salt", "1 tsp", ["1", "tsp"])).toEqual({ status: "missing", original: "1 tsp" });
  // An amount that can't be read.
  expect(one("flour", "some cups", ["some", "cup"])).toEqual({ status: "missing", original: "some cups" });
  // One unknown part makes the whole amount Missing: no half-converted grams.
  expect(one("rice flour", "100 g + 2 tbsp", ["100", "g"], ["2", "tbsp"])).toEqual({ status: "missing", original: "100 g + 2 tbsp", unknown: true });
  // No amount as written: built from the parts.
  expect(one("rice flour", null, ["½", "cup"], ["1", "tbsp"])).toEqual({ status: "missing", original: "½ cup + 1 tbsp", unknown: true });
});

test("rounding: one decimal under 10 g, whole grams from 10 g", () => {
  expect(roundGrams(3.449)).toBe(3.4);
  expect(roundGrams(3.45)).toBe(3.5);
  expect(roundGrams(9.96)).toBe(10);
  expect(roundGrams(10.4)).toBe(10);
  expect(roundGrams(119.8)).toBe(120);
});

test("every table entry can convert something", () => {
  for (const entry of TABLE) {
    const usable = entry.ambiguous || entry.gPerCup || entry.gPerMl || entry.each || entry.stick || entry.can || entry.packet;
    expect(usable, entry.names[0]).toBeTruthy();
    for (const name of entry.names) expect(findEntry(name), name).toBe(entry);
  }
});
