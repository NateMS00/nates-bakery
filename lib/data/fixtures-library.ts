// Extra fixture recipes so the Library has more than 30 items (Show more) and every
// filter has something to find. Their ingredients and steps are brief on purpose.
// "Other" has no recipes, so the Category filter must leave it out.

import type { EditorIngredient, EditorState } from "./editor";
import { IMPORT_FIXTURE_DRAFTS } from "./import-fixtures";
import type { BakeLogEntry, Category, Draft, Ingredient, Recipe, Step } from "./types";

type Simple = {
  id: string;
  title: string;
  category: Category;
  /**
   * The recipe's displayed rating. When `baked` has dates, this lands on the latest
   * bake instead of the legacy recipe column — same move the real migration makes
   * (supabase/migrations/0005_bake_photos_ratings.sql). Only a recipe with no bakes
   * at all keeps it on the recipe directly.
   */
  rating?: number;
  favorite?: boolean;
  /** Bake dates, newest first. */
  baked?: string[];
  created: string;
  makes: [number, string, string];
  minutes: number;
  creator?: string;
  cover?: string;
};

const BASICS: Record<Category, [string, number][]> = {
  bread: [["Strong white bread flour", 500], ["Water", 350], ["Fine salt", 10], ["Instant yeast", 4]],
  viennoiserie: [["Strong white bread flour", 500], ["Whole milk", 150], ["Unsalted butter", 250], ["Caster sugar", 60], ["Instant yeast", 7]],
  "quick-bread": [["Plain flour", 250], ["Baking powder", 8], ["Caster sugar", 60], ["Whole milk", 180], ["Unsalted butter", 75]],
  cake: [["Plain flour", 225], ["Caster sugar", 225], ["Unsalted butter", 225], ["Eggs", 200], ["Baking powder", 6]],
  "cookie-bar": [["Plain flour", 200], ["Unsalted butter", 150], ["Light brown sugar", 150], ["Eggs", 50]],
  "pie-tart": [["Plain flour", 250], ["Unsalted butter, cold", 125], ["Iced water", 60], ["Fine salt", 3]],
  pastry: [["Plain flour", 150], ["Unsalted butter", 100], ["Water", 250], ["Eggs", 200]],
  dessert: [["Double cream", 300], ["Caster sugar", 80], ["Egg yolks", 60], ["Vanilla extract", 5]],
  other: [["Plain flour", 100]],
};

function simple(s: Simple): Recipe {
  const ingredients: Ingredient[] = BASICS[s.category].map(([name, grams], i) => ({
    id: `${s.id}-i${i}`,
    groupId: null,
    name,
    grams,
    status: "confirmed",
  }));
  const steps: Step[] = [
    { id: `${s.id}-s1`, groupId: null, text: "Weigh everything and bring it to room temperature.", timeMarks: [], ingredientIds: ingredients.map((i) => i.id) },
    { id: `${s.id}-s2`, groupId: null, text: "Mix, shape, and rest for 20 minutes.", timeMarks: [{ text: "20 minutes", minutes: 20 }], ingredientIds: [] },
    { id: `${s.id}-s3`, groupId: null, text: `Bake until done, about ${Math.max(10, Math.round(s.minutes / 3))} minutes.`, timeMarks: [{ text: `${Math.max(10, Math.round(s.minutes / 3))} minutes`, minutes: Math.max(10, Math.round(s.minutes / 3)) }], ingredientIds: [] },
  ];
  const baked = s.baked ?? [];
  const bakeLog: BakeLogEntry[] = baked.map((date, i) => ({ id: `${s.id}-b${i}`, date, scale: 1, rating: null, photoPath: null }));
  // The latest bake is index 0 (baked dates are given newest first, same order sortLog produces).
  if (bakeLog.length > 0 && s.rating) bakeLog[0].rating = s.rating;
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    yield: { quantity: s.makes[0], unit: s.makes[1], unitPlural: s.makes[2] },
    totalTimeMinutes: s.minutes,
    source: s.creator ? { creatorHandle: s.creator, reelUrl: `https://www.instagram.com/reel/${s.id}/` } : undefined,
    coverBakeId: null,
    cover: s.cover ?? null,
    ingredientGroups: [],
    stepGroups: [],
    ingredients,
    steps,
    // Only a never-baked recipe keeps its rating on the legacy column (see Simple's rating comment).
    rating: bakeLog.length > 0 ? null : (s.rating ?? null),
    favorite: s.favorite ?? false,
    bakeLog,
    shareLink: null,
    createdAt: `${s.created}T12:00:00Z`,
  };
}

const LOAF: [number, string, string] = [1, "loaf", "loaves"];

/** Every other week back from `from`: a long bake log (Bake Log's Show more after 20). */
function fortnightly(from: string, count: number): string[] {
  const start = Date.parse(`${from}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => new Date(start - i * 14 * 86_400_000).toISOString().slice(0, 10));
}

export const LIBRARY_RECIPES: Recipe[] = [
  simple({ id: "country-sourdough", title: "Country sourdough", category: "bread", rating: 5, favorite: true, baked: fortnightly("2026-09-27", 24), created: "2026-06-02", makes: LOAF, minutes: 1440, creator: "wildyeast.ines" }),
  simple({ id: "focaccia", title: "Rosemary focaccia", category: "bread", rating: 4, baked: ["2026-09-22"], created: "2026-07-11", makes: [1, "tray", "trays"], minutes: 300, creator: "panificio.leo" }),
  simple({ id: "bagels", title: "New York bagels", category: "bread", rating: 3, baked: ["2026-05-18"], created: "2026-05-10", makes: [8, "bagel", "bagels"], minutes: 960, creator: "boilandbake" }),
  simple({ id: "pita", title: "Pillowy pita", category: "bread", created: "2026-09-20", makes: [8, "pita", "pitas"], minutes: 120, creator: "levant.kitchen" }),
  simple({ id: "brioche", title: "Brioche Nanterre", category: "viennoiserie", rating: 5, favorite: true, baked: ["2026-09-06"], created: "2026-04-21", makes: LOAF, minutes: 900, creator: "boulangerie.mo" }),
  simple({ id: "pain-au-chocolat", title: "Pain au chocolat", category: "viennoiserie", rating: 4, baked: ["2026-07-19"], created: "2026-07-01", makes: [12, "pastry", "pastries"], minutes: 1320, creator: "laminated.lou" }),
  simple({ id: "cinnamon-buns", title: "Cardamom and cinnamon buns", category: "viennoiserie", rating: 5, favorite: true, baked: ["2026-09-19", "2026-08-02"], created: "2026-03-14", makes: [12, "bun", "buns"], minutes: 210, creator: "fika.frida" }),
  simple({ id: "banana-bread", title: "Brown butter banana bread", category: "quick-bread", rating: 4, favorite: true, baked: ["2026-09-24"], created: "2026-02-08", makes: LOAF, minutes: 80 }),
  simple({ id: "scones", title: "Buttermilk scones", category: "quick-bread", rating: 3, baked: ["2026-06-15"], created: "2026-06-12", makes: [8, "scone", "scones"], minutes: 40, creator: "teatime.tom" }),
  simple({ id: "blueberry-muffins", title: "Blueberry muffins with a crumble top", category: "quick-bread", created: "2026-08-19", makes: [12, "muffin", "muffins"], minutes: 45, creator: "morningbakes" }),
  simple({ id: "cornbread", title: "Skillet cornbread", category: "quick-bread", rating: 2, baked: ["2026-01-25"], created: "2026-01-20", makes: [1, "skillet", "skillets"], minutes: 35 }),
  simple({ id: "victoria-sponge", title: "Victoria sponge", category: "cake", rating: 4, baked: ["2026-08-24"], created: "2026-03-30", makes: [1, "cake", "cakes"], minutes: 70, creator: "bakewithjuno" }),
  simple({ id: "basque-cheesecake", title: "Burnt Basque cheesecake", category: "cake", rating: 5, favorite: true, baked: ["2026-09-12", "2026-07-04"], created: "2026-05-02", makes: [1, "cake", "cakes"], minutes: 90, creator: "donostia.dulce", cover: "/recipe-pictures/berry.svg" }),
  simple({ id: "carrot-cake", title: "Carrot cake with brown butter cream cheese frosting and toasted walnuts", category: "cake", rating: 4, baked: ["2026-04-12"], created: "2026-04-01", makes: [1, "cake", "cakes"], minutes: 150, creator: "layered.lena" }),
  simple({ id: "olive-oil-cake", title: "Olive oil and orange cake", category: "cake", created: "2026-09-25", makes: [1, "cake", "cakes"], minutes: 75, creator: "citrus.cucina" }),
  simple({ id: "chocolate-cupcakes", title: "Chocolate cupcakes", category: "cake", rating: 3, baked: ["2025-12-20"], created: "2025-12-15", makes: [12, "cupcake", "cupcakes"], minutes: 50 }),
  simple({ id: "fudgy-brownies", title: "Fudgy brownies", category: "cookie-bar", rating: 5, favorite: true, baked: ["2026-09-28", "2026-09-01"], created: "2025-11-11", makes: [16, "brownie", "brownies"], minutes: 55, creator: "cocoa.carla", cover: "/recipe-pictures/chocolate.svg" }),
  simple({ id: "shortbread", title: "Scottish shortbread", category: "cookie-bar", rating: 4, baked: ["2025-12-23"], created: "2025-12-01", makes: [16, "finger", "fingers"], minutes: 60 }),
  simple({ id: "oatmeal-cookies", title: "Oatmeal raisin cookies", category: "cookie-bar", rating: 1, baked: ["2026-02-14"], created: "2026-02-10", makes: [24, "cookie", "cookies"], minutes: 40, creator: "cookiejar.co" }),
  simple({ id: "lemon-bars", title: "Lemon bars", category: "cookie-bar", created: "2026-09-26", makes: [16, "bar", "bars"], minutes: 70, creator: "sunny.bakes" }),
  simple({ id: "apple-pie", title: "Double-crust apple pie", category: "pie-tart", rating: 4, baked: ["2026-09-15"], created: "2025-10-05", makes: [1, "pie", "pies"], minutes: 180, creator: "pie.society" }),
  simple({ id: "tarte-tatin", title: "Tarte Tatin", category: "pie-tart", rating: 5, baked: ["2026-03-08"], created: "2026-03-01", makes: [1, "tart", "tarts"], minutes: 90, creator: "patisserie.claude" }),
  simple({ id: "quiche-lorraine", title: "Quiche Lorraine", category: "pie-tart", rating: 3, baked: ["2026-06-28"], created: "2026-06-20", makes: [1, "quiche", "quiches"], minutes: 120 }),
  simple({ id: "plum-galette", title: "Plum and almond galette", category: "pie-tart", created: "2026-09-10", makes: [1, "galette", "galettes"], minutes: 100, creator: "rustic.crust" }),
  simple({ id: "choux-buns", title: "Craquelin choux buns", category: "pastry", rating: 4, baked: ["2026-08-16"], created: "2026-08-10", makes: [16, "bun", "buns"], minutes: 150, creator: "choux.chou" }),
  simple({ id: "palmiers", title: "Palmiers", category: "pastry", rating: 3, baked: ["2026-05-03"], created: "2026-04-28", makes: [24, "palmier", "palmiers"], minutes: 60 }),
  simple({ id: "apple-strudel", title: "Apple strudel", category: "pastry", created: "2026-09-02", makes: [1, "strudel", "strudels"], minutes: 120, creator: "wiener.backstube" }),
  simple({ id: "creme-brulee", title: "Crème brûlée", category: "dessert", rating: 5, favorite: true, baked: ["2026-09-09"], created: "2026-01-30", makes: [6, "ramekin", "ramekins"], minutes: 300, creator: "petit.pot" }),
  simple({ id: "pavlova", title: "Summer berry pavlova", category: "dessert", rating: 4, baked: ["2026-07-26"], created: "2026-07-20", makes: [1, "pavlova", "pavlovas"], minutes: 240, creator: "meringue.mae" }),
  // Rated but never baked (the migration's edge case, SKELETON 1.5.0 Assumptions):
  // keeps this rating as its displayed one until its first rated bake.
  simple({ id: "tiramisu", title: "Tiramisu", category: "dessert", rating: 4, created: "2026-08-28", makes: [8, "serving", "servings"], minutes: 360 }),
];

// Drafts for the Library and Review Import. The babka is the main review case: groups,
// 2 Missing, 3 Estimated, 1 Converted, a caption and a spoken transcript. The canelés
// have nothing flagged. The madeleines have no caption and no groups.

const ing = (id: string, groupId: string | null, name: string, amount: string, status: EditorIngredient["status"] = "confirmed", original?: string): EditorIngredient => ({
  id, groupId, name, amount, toTaste: false, status, original,
});

const babka: EditorState = {
  title: "Chocolate tahini babka with a sesame crunch topping and a sticky syrup glaze",
  category: "viennoiserie",
  categorySuggested: true,
  yieldQuantity: "2",
  yieldUnit: "loaves",
  hours: "14",
  minutes: "30",
  sourceUrl: "https://www.instagram.com/reel/Cbabka22/",
  creatorHandle: "braided.bea",
  ingredientGroups: [
    { id: "bg-dough", name: "Dough" },
    { id: "bg-filling", name: "Filling" },
    { id: "bg-syrup", name: "Syrup" },
  ],
  stepGroups: [
    { id: "bs-dough", name: "Dough" },
    { id: "bs-filling", name: "Filling" },
    { id: "bs-assembly", name: "Assembly" },
    { id: "bs-baking", name: "Baking" },
  ],
  ingredients: [
    ing("b-flour", "bg-dough", "Strong white bread flour", "500"),
    ing("b-milk", "bg-dough", "Whole milk, lukewarm", "120", "converted", "½ cup"),
    ing("b-sugar", "bg-dough", "Caster sugar", "100", "estimated"),
    ing("b-yeast", "bg-dough", "Instant yeast", "7"),
    ing("b-eggs", "bg-dough", "Eggs", "150"),
    ing("b-butter", "bg-dough", "Unsalted butter, soft", ""),
    ing("b-salt", "bg-dough", "Fine salt", ""),
    ing("b-choc", "bg-filling", "Dark chocolate, 70%", "150"),
    ing("b-tahini", "bg-filling", "Tahini", "120", "converted", "½ cup"),
    ing("b-cocoa", "bg-filling", "Cocoa powder", "30", "estimated"),
    ing("b-sesame", "bg-filling", "Toasted sesame seeds", "20"),
    ing("b-syrup-sugar", "bg-syrup", "Granulated sugar", "100"),
    ing("b-water", "bg-syrup", "Water", "80", "estimated"),
  ],
  steps: [
    { id: "bst-1", groupId: "bs-dough", text: "Mix the flour, sugar, yeast, milk and eggs for 5 minutes, then add the salt and knead in the butter a little at a time.", ingredientIds: ["b-flour", "b-sugar", "b-yeast", "b-milk", "b-eggs", "b-salt", "b-butter"] },
    { id: "bst-2", groupId: "bs-dough", text: "Cover and refrigerate overnight, at least 12 hours.", ingredientIds: [] },
    { id: "bst-3", groupId: "bs-filling", text: "Melt the chocolate and stir in the tahini, cocoa and half the sesame seeds.", ingredientIds: ["b-choc", "b-tahini", "b-cocoa", "b-sesame"] },
    { id: "bst-4", groupId: "bs-assembly", text: "Roll each half of the dough into a rectangle, spread with filling, roll up, halve lengthways and twist. Proof for 1 to 2 hours.", ingredientIds: [] },
    { id: "bst-5", groupId: "bs-baking", text: "Bake at 180 °C for 35 minutes. Boil the sugar and water for 2 min and brush over the hot loaves.", ingredientIds: ["b-syrup-sugar", "b-water", "b-sesame"] },
  ],
};

const canele: EditorState = {
  title: "Canelés de Bordeaux",
  category: "pastry",
  categorySuggested: true,
  yieldQuantity: "12",
  yieldUnit: "canelés",
  hours: "49",
  minutes: "",
  sourceUrl: "https://www.instagram.com/reel/Ccanele7/",
  creatorHandle: "bordeaux.bakes",
  ingredientGroups: [],
  stepGroups: [],
  ingredients: [
    ing("c-milk", null, "Whole milk", "500"),
    ing("c-butter", null, "Unsalted butter", "50"),
    ing("c-flour", null, "Plain flour", "100"),
    ing("c-sugar", null, "Caster sugar", "200"),
    ing("c-yolks", null, "Egg yolks", "80"),
    ing("c-rum", null, "Dark rum", "50"),
    { id: "c-vanilla", groupId: null, name: "Vanilla pod", amount: "", toTaste: true, status: "confirmed" },
  ],
  steps: [
    { id: "cst-1", groupId: null, text: "Heat the milk with the butter and vanilla, then cool.", ingredientIds: ["c-milk", "c-butter", "c-vanilla"] },
    { id: "cst-2", groupId: null, text: "Whisk in the flour, sugar, yolks and rum. Rest in the fridge for 48 hours.", ingredientIds: ["c-flour", "c-sugar", "c-yolks", "c-rum"] },
    { id: "cst-3", groupId: null, text: "Bake at 230 °C for 15 minutes, then at 180 °C for 45 minutes.", ingredientIds: [] },
  ],
};

const madeleines: EditorState = {
  title: "Brown butter madeleines",
  category: "cake",
  categorySuggested: true,
  yieldQuantity: "24",
  yieldUnit: "madeleines",
  hours: "",
  minutes: "90",
  sourceUrl: "https://www.instagram.com/reel/Cmadel3/",
  creatorHandle: "coquille.co",
  ingredientGroups: [],
  stepGroups: [],
  ingredients: [
    ing("m-butter", null, "Unsalted butter", "125"),
    ing("m-eggs", null, "Eggs", "100"),
    ing("m-sugar", null, "Caster sugar", "100"),
    ing("m-flour", null, "Plain flour", "120", "converted", "1 cup"),
    ing("m-honey", null, "Honey", "20", "estimated"),
  ],
  steps: [
    { id: "mst-1", groupId: null, text: "Brown the butter and let it cool.", ingredientIds: ["m-butter"] },
    { id: "mst-2", groupId: null, text: "Whisk the eggs, sugar and honey, fold in the flour and butter, and chill for 1 hour.", ingredientIds: ["m-eggs", "m-sugar", "m-honey", "m-flour"] },
    { id: "mst-3", groupId: null, text: "Bake at 200 °C for 9 minutes.", ingredientIds: [] },
  ],
};

export const DRAFTS: Draft[] = [
  // Always-recent createdAt: stays "importing" rather than expiring into "failed"
  // (BONES-recipes.md 1.4.0's 10-minute stale timeout) no matter when it's read.
  { id: "d-importing", status: "importing", title: null, creatorHandle: "kouign.kate", reelUrl: "https://www.instagram.com/reel/Ckouign01/", createdAt: new Date().toISOString() },
  {
    id: "d-babka",
    status: "ready",
    title: babka.title,
    creatorHandle: "braided.bea",
    reelUrl: babka.sourceUrl,
    createdAt: "2026-09-29T19:40:00Z",
    caption:
      "The babka that broke my feed 🍫 Tahini + dark chocolate + a crunchy sesame top. Recipe below! 500g bread flour, 1/2 cup warm milk, sugar, 7g yeast, 3 eggs, soft butter, salt. Filling: 150g dark chocolate, 1/2 cup tahini, a few spoons of cocoa, sesame. Syrup: 100g sugar + a splash of water. Save this for the weekend!",
    content: babka,
    // Exercises Source's real-picture state (SKELETON 1.4.6); d-canele and
    // d-madeleines stay pictureless, exercising the placeholder state.
    picture: "/recipe-pictures/chocolate.svg",
  },
  {
    id: "d-canele",
    status: "ready",
    title: canele.title,
    creatorHandle: "bordeaux.bakes",
    reelUrl: canele.sourceUrl,
    createdAt: "2026-09-28T21:05:00Z",
    caption: "Canelés, the real Bordeaux way. Two days of patience for that crust. Rest the batter forty-eight hours in the fridge. Don't skip it, that's what gives the crust its crackle.",
    content: canele,
  },
  {
    id: "d-madeleines",
    status: "ready",
    title: madeleines.title,
    creatorHandle: "coquille.co",
    reelUrl: madeleines.sourceUrl,
    createdAt: "2026-09-21T10:00:00Z",
    caption: "Brown butter, honey, and a cold batter. That's the hump. Rest the batter at least an hour before baking for the classic bump.",
    content: madeleines,
  },
  ...IMPORT_FIXTURE_DRAFTS,
];

/** STUB extraction result for a newly imported reel: a kouign-amann with things to check. */
export function importedContent(reelUrl: string): EditorState {
  return {
    title: "Kouign-amann",
    category: "viennoiserie",
    categorySuggested: true,
    yieldQuantity: "12",
    yieldUnit: "pastries",
    hours: "4",
    minutes: "",
    sourceUrl: reelUrl,
    creatorHandle: "kouign.kate",
    ingredientGroups: [],
    stepGroups: [],
    ingredients: [
      ing("k-flour", null, "Strong white bread flour", "300"),
      ing("k-water", null, "Water", "200", "converted", "¾ cup + 2 tbsp"),
      ing("k-yeast", null, "Instant yeast", "5"),
      ing("k-butter", null, "Salted butter, cold", ""),
      ing("k-sugar", null, "Caster sugar", "200", "estimated"),
    ],
    steps: [
      { id: "kst-1", groupId: null, text: "Mix the flour, water and yeast and rest for 1 hour.", ingredientIds: ["k-flour", "k-water", "k-yeast"] },
      { id: "kst-2", groupId: null, text: "Laminate with the butter, sprinkling sugar on every fold.", ingredientIds: ["k-butter", "k-sugar"] },
      { id: "kst-3", groupId: null, text: "Shape into 12 tins and bake at 200 °C for 25 minutes.", ingredientIds: [] },
    ],
  };
}
