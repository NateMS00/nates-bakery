// Typed fixture data, the only data source until the backend is chosen.
// Covers: the pastel de nata recipe from design-reference/recipe-preview.html,
// a long recipe with several groups, a manual recipe without a source, and
// empty cases (never baked, unrated, no groups, baked without notes).

import type { Ingredient, Recipe, Step, TimeMark } from "./types";

function ing(
  id: string,
  groupId: string | null,
  name: string,
  grams: number | null,
  extra: Partial<Pick<Ingredient, "status" | "original">> = {},
): Ingredient {
  return {
    id,
    groupId,
    name,
    grams,
    status: extra.status ?? (grams === null ? "to-taste" : "confirmed"),
    original: extra.original,
  };
}

function step(
  id: string,
  groupId: string | null,
  text: string,
  ingredientIds: string[] = [],
  timeMarks: TimeMark[] = [],
): Step {
  return { id, groupId, text, ingredientIds, timeMarks };
}

const pasteisDeNata: Recipe = {
  id: "pasteis-de-nata",
  title: "Pastéis de nata",
  category: "pastry",
  yield: { quantity: 12, unit: "tart", unitPlural: "tarts" },
  totalTimeMinutes: 210,
  source: { creatorHandle: "forno.da.rita", reelUrl: "https://www.instagram.com/reel/C9nataRita01/" },
  ingredientGroups: [
    { id: "ig-pastry", name: "Pastry" },
    { id: "ig-custard", name: "Custard" },
  ],
  stepGroups: [
    { id: "sg-pastry", name: "Pastry" },
    { id: "sg-custard", name: "Custard" },
    { id: "sg-baking", name: "Baking" },
  ],
  ingredients: [
    ing("p-flour", "ig-pastry", "Plain flour", 250),
    ing("p-salt", "ig-pastry", "Fine salt", 3.5),
    ing("p-water", "ig-pastry", "Cold water", 175),
    ing("p-butter", "ig-pastry", "Unsalted butter, soft, for laminating", 200),
    ing("c-milk", "ig-custard", "Whole milk", 250),
    ing("c-flour", "ig-custard", "Plain flour", 30),
    ing("c-sugar", "ig-custard", "Caster sugar", 250, { status: "converted", original: "1¼ cups" }),
    ing("c-water", "ig-custard", "Water", 160),
    ing("c-yolks", "ig-custard", "Egg yolks", 108, { status: "estimated" }),
    ing("c-aromatics", "ig-custard", "Cinnamon stick and lemon peel", null),
  ],
  steps: [
    step("n1", "sg-pastry", "Mix the flour, salt and water into a soft dough. Cover and rest for 15 min.", ["p-flour", "p-salt", "p-water"], [{ text: "15 min", minutes: 15 }]),
    step("n2", "sg-pastry", "Roll into a thin square, spread a third of the butter over it and roll it up. Repeat twice.", ["p-butter"]),
    step("n3", "sg-pastry", "Roll into a tight log, wrap and chill for 2 hours.", [], [{ text: "2 hours", minutes: 120 }]),
    step("n4", "sg-custard", "Whisk the flour with a little milk. Heat the rest of the milk with the cinnamon and lemon peel.", ["c-flour", "c-milk", "c-aromatics"]),
    step("n5", "sg-custard", "Boil the sugar and water to a light syrup, about 3 minutes.", ["c-sugar", "c-water"], [{ text: "3 minutes", minutes: 3 }]),
    step("n6", "sg-custard", "Combine milk and syrup, let it cool, whisk in the yolks and strain.", ["c-yolks"]),
    step("n7", "sg-baking", "Slice the log into 12 discs and press each into a tin with wet thumbs."),
    step("n8", "sg-baking", "Fill three quarters full and bake at 290 °C for 12 minutes, until blistered.", [], [{ text: "12 minutes", minutes: 12 }]),
  ],
  rating: 4,
  favorite: true,
  bakeLog: [
    {
      id: "nata-b3",
      date: "2026-09-26",
      scale: 1,
      whatChanged: "Rolled the log tighter and baked 2 minutes longer at the highest setting.",
      howItTurnedOut: "Blistered tops and crisp layers. Custard still a little loose in the middle.",
    },
    { id: "nata-b2", date: "2026-09-12", scale: 1, howItTurnedOut: "Pale tops. Oven wasn't hot enough." },
    { id: "nata-b1", date: "2026-08-30", scale: 0.5 },
  ],
  shareLink: { token: "nata-k7p2qw", createdAt: "2026-09-27T10:12:00Z" },
  createdAt: "2026-08-28T19:40:00Z",
};

const croissants: Recipe = {
  id: "cultured-butter-croissants",
  title: "Croissants with a cultured butter block and an overnight cold proof",
  category: "viennoiserie",
  yield: { quantity: 12, unit: "croissant", unitPlural: "croissants" },
  totalTimeMinutes: 1260,
  source: { creatorHandle: "laminated.lou", reelUrl: "https://www.instagram.com/reel/C8croissLou22/" },
  ingredientGroups: [
    { id: "cg-dough", name: "Dough" },
    { id: "cg-butter", name: "Butter block" },
    { id: "cg-wash", name: "Egg wash" },
  ],
  stepGroups: [
    { id: "cs-dough", name: "Dough" },
    { id: "cs-butter", name: "Butter block" },
    { id: "cs-lamination", name: "Lamination" },
    { id: "cs-assembly", name: "Assembly" },
    { id: "cs-baking", name: "Baking" },
  ],
  ingredients: [
    ing("cr-flour", "cg-dough", "Strong white bread flour", 500),
    ing("cr-milk", "cg-dough", "Whole milk, cold", 140, { status: "converted", original: "½ cup + 1 tbsp" }),
    ing("cr-water", "cg-dough", "Cold water", 120),
    ing("cr-sugar", "cg-dough", "Caster sugar", 55),
    ing("cr-yeast", "cg-dough", "Instant yeast", 5.5),
    ing("cr-salt", "cg-dough", "Fine salt", 9.5),
    ing("cr-soft-butter", "cg-dough", "Unsalted butter, softened", 40),
    ing("cr-block", "cg-butter", "Cold unsalted cultured butter, at least 82% fat, ideally a European-style block for laminating", 280),
    ing("cr-block-flour", "cg-butter", "Strong white bread flour, for the block", 15, { status: "estimated" }),
    ing("cr-egg", "cg-wash", "Egg", 50),
    ing("cr-wash-milk", "cg-wash", "Whole milk", 15),
    ing("cr-wash-salt", "cg-wash", "Pinch of fine salt", null),
  ],
  steps: [
    step("c1", "cs-dough", "Mix the flour, sugar, yeast and salt. Add the milk, water and softened butter and mix for 4 minutes until no dry flour is left.", ["cr-flour", "cr-sugar", "cr-yeast", "cr-salt", "cr-milk", "cr-water", "cr-soft-butter"], [{ text: "4 minutes", minutes: 4 }]),
    step("c2", "cs-dough", "Knead for 6 minutes, shape into a flat rectangle, wrap and refrigerate overnight, about 12 hours.", [], [{ text: "6 minutes", minutes: 6 }, { text: "12 hours", minutes: 720 }]),
    step("c3", "cs-butter", "Beat the cold butter with the flour between two sheets of baking paper into a 17 cm square.", ["cr-block", "cr-block-flour"]),
    step("c4", "cs-butter", "Chill the butter block for 30 minutes so it bends without cracking.", [], [{ text: "30 minutes", minutes: 30 }]),
    step("c5", "cs-lamination", "Roll the dough into a 34 cm square, set the butter block on it like a diamond and fold the corners over to seal."),
    step("c6", "cs-lamination", "Roll into a long rectangle and give it a letter fold. Wrap and chill for 30 minutes.", [], [{ text: "30 minutes", minutes: 30 }]),
    step("c7", "cs-lamination", "Repeat the roll and letter fold, then chill again for 30 minutes.", [], [{ text: "30 minutes", minutes: 30 }]),
    step("c8", "cs-lamination", "Give it a final fold and rest it in the fridge for 1 hour.", [], [{ text: "1 hour", minutes: 60 }]),
    step("c9", "cs-assembly", "Roll to 4 mm thick and trim the edges. Cut 12 long triangles with a 9 cm base."),
    step("c10", "cs-assembly", "Stretch each triangle gently, cut a small notch in the base and roll up towards the tip."),
    step("c11", "cs-assembly", "Proof at 26 °C for 2 hours, then chill for 10 minutes so the layers stay distinct.", [], [{ text: "2 hours", minutes: 120 }, { text: "10 minutes", minutes: 10 }]),
    step("c12", "cs-baking", "Whisk the egg, milk and salt and brush the croissants thinly.", ["cr-egg", "cr-wash-milk", "cr-wash-salt"]),
    step("c13", "cs-baking", "Bake at 190 °C for 18 minutes, until deep golden.", [], [{ text: "18 minutes", minutes: 18 }]),
    step("c14", "cs-baking", "Cool on the tray for 15 minutes before eating.", [], [{ text: "15 minutes", minutes: 15 }]),
  ],
  rating: 5,
  favorite: false,
  bakeLog: [
    {
      id: "cr-b2",
      date: "2026-09-20",
      scale: 1.5,
      whatChanged:
        "Used the cultured butter from the market instead of supermarket butter, rolled the dough a millimetre thinner for the final shaping, and cut the proof by 20 minutes because the kitchen was warm. Also moved the tray one shelf up for the last 5 minutes.",
      howItTurnedOut:
        "The best honeycomb so far, with clean layers all the way through and no butter leaking on the tray. Slightly too dark on the bottoms, so next time a second tray underneath. They stayed crisp until the next morning.",
    },
    { id: "cr-b1", date: "2025-12-14", scale: 1, whatChanged: "First try, followed the reel exactly." },
  ],
  shareLink: null,
  createdAt: "2025-12-10T08:00:00Z",
};

const chocolateChipCookies: Recipe = {
  id: "brown-butter-cookies",
  title: "Brown butter chocolate chip cookies",
  category: "cookie-bar",
  yield: { quantity: 36, unit: "cookie", unitPlural: "cookies" },
  totalTimeMinutes: 90,
  ingredientGroups: [],
  stepGroups: [],
  ingredients: [
    ing("k-butter", null, "Unsalted butter", 225),
    ing("k-brown", null, "Dark brown sugar", 200),
    ing("k-caster", null, "Caster sugar", 100),
    ing("k-eggs", null, "Eggs", 100),
    ing("k-vanilla", null, "Vanilla extract", 8),
    ing("k-flour", null, "Plain flour", 310),
    ing("k-soda", null, "Bicarbonate of soda", 5),
    ing("k-salt", null, "Fine salt", 4),
    ing("k-choc", null, "Dark chocolate, chopped", 280),
    ing("k-flaky", null, "Flaky sea salt, to finish", null),
  ],
  steps: [
    step("k0", null, "Weigh out everything and line two trays.", ["k-butter", "k-brown", "k-caster", "k-eggs", "k-vanilla", "k-flour", "k-soda", "k-salt", "k-choc", "k-flaky"]),
    step("k1", null, "Brown the butter over medium heat until it smells nutty, about 6 minutes. Pour into a bowl and cool for 15 minutes.", ["k-butter"], [{ text: "6 minutes", minutes: 6 }, { text: "15 minutes", minutes: 15 }]),
    step("k2", null, "Whisk in both sugars, then the eggs and vanilla until glossy.", ["k-brown", "k-caster", "k-eggs", "k-vanilla"]),
    step("k3", null, "Fold in the flour, bicarbonate of soda and salt, then the chocolate.", ["k-flour", "k-soda", "k-salt", "k-choc"]),
    step("k4", null, "Scoop 36 balls onto lined trays and chill for 30 minutes.", [], [{ text: "30 minutes", minutes: 30 }]),
    step("k5", null, "Bake at 180 °C for 11 minutes, until the edges are set.", [], [{ text: "11 minutes", minutes: 11 }]),
    step("k6", null, "Sprinkle with flaky salt and cool on the tray.", ["k-flaky"]),
  ],
  rating: null,
  favorite: false,
  bakeLog: [],
  shareLink: null,
  createdAt: "2026-09-18T20:15:00Z",
};

const lemonDrizzle: Recipe = {
  id: "lemon-drizzle-loaf",
  title: "Lemon drizzle loaf",
  category: "cake",
  yield: { quantity: 1, unit: "loaf", unitPlural: "loaves" },
  totalTimeMinutes: 75,
  source: { creatorHandle: "bakewithjuno", reelUrl: "https://www.instagram.com/reel/C7lemonJuno9/" },
  ingredientGroups: [],
  stepGroups: [],
  ingredients: [
    ing("l-butter", null, "Unsalted butter, soft", 175),
    ing("l-sugar", null, "Caster sugar", 175),
    ing("l-eggs", null, "Eggs", 150, { status: "estimated" }),
    ing("l-flour", null, "Self-raising flour", 175),
    ing("l-zest", null, "Lemon zest", 6, { status: "estimated" }),
    ing("l-juice", null, "Lemon juice", 45, { status: "estimated" }),
    ing("l-icing", null, "Granulated sugar, for the drizzle", 85, { status: "converted", original: "⅓ cup" }),
  ],
  steps: [
    step("l1", null, "Beat the butter and sugar until pale, then beat in the eggs one at a time.", ["l-butter", "l-sugar", "l-eggs"]),
    step("l2", null, "Fold in the flour and zest and spoon into a lined loaf tin.", ["l-flour", "l-zest"]),
    step("l3", null, "Bake at 180 °C for 45 minutes, until a skewer comes out clean.", [], [{ text: "45 minutes", minutes: 45 }]),
    step("l4", null, "Stir the lemon juice with the sugar and spoon over the warm loaf. Cool in the tin.", ["l-juice", "l-icing"]),
  ],
  rating: null,
  favorite: true,
  bakeLog: [{ id: "l-b1", date: "2026-09-05", scale: 1 }],
  shareLink: null,
  createdAt: "2026-09-01T16:30:00Z",
};

export const RECIPES: Recipe[] = [pasteisDeNata, croissants, chocolateChipCookies, lemonDrizzle];
