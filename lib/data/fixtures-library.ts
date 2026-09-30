// Extra fixture recipes so the Library has more than 30 items (Show more) and every
// filter has something to find. Their ingredients and steps are brief on purpose.
// "Other" has no recipes, so the Category filter must leave it out.

import type { Category, Draft, Ingredient, Recipe, Step } from "./types";

type Simple = {
  id: string;
  title: string;
  category: Category;
  rating?: number;
  favorite?: boolean;
  /** Bake dates, newest first. */
  baked?: string[];
  created: string;
  makes: [number, string, string];
  minutes: number;
  creator?: string;
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
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    yield: { quantity: s.makes[0], unit: s.makes[1], unitPlural: s.makes[2] },
    totalTimeMinutes: s.minutes,
    source: s.creator ? { creatorHandle: s.creator, reelUrl: `https://www.instagram.com/reel/${s.id}/` } : undefined,
    ingredientGroups: [],
    stepGroups: [],
    ingredients,
    steps,
    rating: s.rating ?? null,
    favorite: s.favorite ?? false,
    bakeLog: (s.baked ?? []).map((date, i) => ({ id: `${s.id}-b${i}`, date, scale: 1 })),
    shareLink: null,
    createdAt: `${s.created}T12:00:00Z`,
  };
}

const LOAF: [number, string, string] = [1, "loaf", "loaves"];

export const LIBRARY_RECIPES: Recipe[] = [
  simple({ id: "country-sourdough", title: "Country sourdough", category: "bread", rating: 5, favorite: true, baked: ["2026-09-27", "2026-09-13", "2026-08-30"], created: "2026-06-02", makes: LOAF, minutes: 1440, creator: "wildyeast.ines" }),
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
  simple({ id: "basque-cheesecake", title: "Burnt Basque cheesecake", category: "cake", rating: 5, favorite: true, baked: ["2026-09-12", "2026-07-04"], created: "2026-05-02", makes: [1, "cake", "cakes"], minutes: 90, creator: "donostia.dulce" }),
  simple({ id: "carrot-cake", title: "Carrot cake with brown butter cream cheese frosting and toasted walnuts", category: "cake", rating: 4, baked: ["2026-04-12"], created: "2026-04-01", makes: [1, "cake", "cakes"], minutes: 150, creator: "layered.lena" }),
  simple({ id: "olive-oil-cake", title: "Olive oil and orange cake", category: "cake", created: "2026-09-25", makes: [1, "cake", "cakes"], minutes: 75, creator: "citrus.cucina" }),
  simple({ id: "chocolate-cupcakes", title: "Chocolate cupcakes", category: "cake", rating: 3, baked: ["2025-12-20"], created: "2025-12-15", makes: [12, "cupcake", "cupcakes"], minutes: 50 }),
  simple({ id: "fudgy-brownies", title: "Fudgy brownies", category: "cookie-bar", rating: 5, favorite: true, baked: ["2026-09-28", "2026-09-01"], created: "2025-11-11", makes: [16, "brownie", "brownies"], minutes: 55, creator: "cocoa.carla" }),
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
  simple({ id: "tiramisu", title: "Tiramisu", category: "dessert", created: "2026-08-28", makes: [8, "serving", "servings"], minutes: 360 }),
];

export const DRAFTS: Draft[] = [
  { id: "d-importing", status: "importing", title: null, creatorHandle: "kouign.kate", reelUrl: "https://www.instagram.com/reel/Ckouign01/", createdAt: "2026-09-30T08:10:00Z" },
  { id: "d-babka", status: "ready", title: "Chocolate tahini babka with a sesame crunch topping and a sticky syrup glaze", creatorHandle: "braided.bea", reelUrl: "https://www.instagram.com/reel/Cbabka22/", createdAt: "2026-09-29T19:40:00Z" },
  { id: "d-canele", status: "ready", title: "Canelés de Bordeaux", creatorHandle: "bordeaux.bakes", reelUrl: "https://www.instagram.com/reel/Ccanele7/", createdAt: "2026-09-28T21:05:00Z" },
  { id: "d-madeleines", status: "ready", title: "Brown butter madeleines", creatorHandle: "coquille.co", reelUrl: "https://www.instagram.com/reel/Cmadel3/", createdAt: "2026-09-21T10:00:00Z" },
];
