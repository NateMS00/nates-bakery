// The Recipe Editor's form state (BONES-import-detail, Recipe Editor), shared by
// Review Import (where it autosaves to the draft), New Recipe, and Edit Recipe.
// Numbers stay strings while editing; toRecipe() converts them on save.

import type { AmountStatus, Category, Group, Recipe, RecipeYield, TimeMark } from "./types";

export interface EditorIngredient {
  id: string;
  groupId: string | null;
  name: string;
  /** Grams as typed. Empty and not to taste means Missing. */
  amount: string;
  toTaste: boolean;
  /** Estimated and Converted keep their marker until confirmed or changed. */
  status: Exclude<AmountStatus, "to-taste">;
  /** The stated amount before conversion ("1 cup"). */
  original?: string;
  /** Optional remark about the ingredient (Add note / Edit note in the row menu). */
  note?: string;
}

export interface EditorStep {
  id: string;
  groupId: string | null;
  text: string;
  ingredientIds: string[];
}

export interface EditorState {
  title: string;
  category: Category | "";
  /** True while the category is the importer's suggestion, until changed. */
  categorySuggested: boolean;
  yieldQuantity: string;
  /** What the yield counts, as the owner writes it ("cookies", "loaf"). */
  yieldUnit: string;
  hours: string;
  minutes: string;
  sourceUrl: string;
  creatorHandle?: string;
  ingredientGroups: Group[];
  stepGroups: Group[];
  ingredients: EditorIngredient[];
  steps: EditorStep[];
}

export const isMissing = (i: EditorIngredient) => !i.toTaste && i.amount.trim() === "";

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// ── Time detection (SKELETON: times written in a step are detected for Bake Mode) ──

const WORD_NUMBERS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, ten: 10, fifteen: 15, twenty: 20, thirty: 30 };
const TIME_RE =
  /\b(\d+(?:[.,]\d+)?|a|an|one|two|three|four|five|six|ten|fifteen|twenty|thirty)(?:\s*(?:-|to|–)\s*(\d+(?:[.,]\d+)?))?\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?)\b/gi;

/** "bake 25 minutes, then rest 10 min" → two marks. Ranges use their upper bound. */
export function detectTimes(text: string): TimeMark[] {
  const marks: TimeMark[] = [];
  for (const m of text.matchAll(TIME_RE)) {
    const [whole, first, second, unit] = m;
    const n = Number((second ?? first).replace(",", ".")) || WORD_NUMBERS[first.toLowerCase()] || 0;
    if (!n) continue;
    const u = unit.toLowerCase();
    // A bare "m" or "h" needs a digit right before it ("25m"), so "a m" never matches.
    if ((u === "m" || u === "h") && !/\d\s*[mh]$/i.test(whole)) continue;
    const minutes = u.startsWith("h") ? n * 60 : u.startsWith("s") ? Math.max(1, Math.round(n / 60)) : n;
    marks.push({ text: whole, minutes: Math.round(minutes) });
  }
  return marks;
}

export function formatTimeChip(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
}

// ── Checks and blockers ──

export interface CheckItem {
  kind: "missing" | "estimated" | "converted";
  ingredient: EditorIngredient;
}

/** Needs Your Check order: Missing, then Estimated, then Converted. */
export function checkItems(state: EditorState): CheckItem[] {
  const named = state.ingredients.filter((i) => i.name.trim() || i.amount.trim());
  return [
    ...named.filter(isMissing).map((ingredient) => ({ kind: "missing" as const, ingredient })),
    ...named.filter((i) => !isMissing(i) && !i.toTaste && i.status === "estimated").map((ingredient) => ({ kind: "estimated" as const, ingredient })),
    ...named.filter((i) => !isMissing(i) && !i.toTaste && i.status === "converted").map((ingredient) => ({ kind: "converted" as const, ingredient })),
  ];
}

export interface Problem {
  /** The id of the field to focus. */
  fieldId: string;
  message: string;
}

/** What blocks saving: an empty title, no category, and every Missing amount. */
export function blockers(state: EditorState): Problem[] {
  const problems: Problem[] = [];
  if (!state.title.trim()) problems.push({ fieldId: "editor-title", message: "Enter a title" });
  if (!state.category) problems.push({ fieldId: "editor-category", message: "Choose a category" });
  for (const { ingredient } of checkItems(state).filter((c) => c.kind === "missing")) {
    problems.push({ fieldId: amountFieldId(ingredient.id), message: `Enter an amount for ${ingredient.name.trim() || "the unnamed ingredient"}, or mark it to taste` });
  }
  return problems;
}

/** The Save bar's status line: the same count and wording as the error summary. */
export function saveStatus(problemCount: number): string {
  if (problemCount === 0) return "Ready to save";
  return `${problemCount} ${problemCount === 1 ? "thing" : "things"} to fix`;
}

export const amountFieldId = (ingredientId: string) => `ing-${ingredientId}-amount`;
export const nameFieldId = (ingredientId: string) => `ing-${ingredientId}-name`;

export function parseGrams(amount: string): number | null {
  const n = Number(amount.replace(",", ".").trim());
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// ── Conversions ──

/** Naive singular for the yield unit ("loaves" → "loaf", "cookies" → "cookie"). */
export function singular(unit: string): string {
  const u = unit.trim();
  if (/ves$/i.test(u)) return u.replace(/ves$/i, "f");
  if (/ies$/i.test(u)) return u.replace(/ies$/i, "y");
  if (/(ch|sh|ss|x)es$/i.test(u)) return u.slice(0, -2);
  if (/s$/i.test(u) && !/ss$/i.test(u)) return u.slice(0, -1);
  return u;
}

export function plural(unit: string): string {
  if (/[^aeiou]y$/i.test(unit)) return unit.replace(/y$/i, "ies");
  if (/(?<!f)f$/i.test(unit)) return unit.replace(/f$/i, "ves");
  if (/(ch|sh|s|x)$/i.test(unit)) return `${unit}es`;
  return `${unit}s`;
}

export function emptyEditor(sourceUrl = ""): EditorState {
  return {
    title: "",
    category: "",
    categorySuggested: false,
    yieldQuantity: "",
    yieldUnit: "",
    hours: "",
    minutes: "",
    sourceUrl,
    ingredientGroups: [],
    stepGroups: [],
    ingredients: [{ id: newId("i"), groupId: null, name: "", amount: "", toTaste: false, status: "confirmed" }],
    steps: [{ id: newId("s"), groupId: null, text: "", ingredientIds: [] }],
  };
}

export function fromRecipe(r: Recipe): EditorState {
  return {
    title: r.title,
    category: r.category,
    categorySuggested: false,
    yieldQuantity: String(r.yield.quantity),
    yieldUnit: r.yield.quantity === 1 ? r.yield.unit : r.yield.unitPlural,
    hours: r.totalTimeMinutes >= 60 ? String(Math.floor(r.totalTimeMinutes / 60)) : "",
    minutes: r.totalTimeMinutes % 60 ? String(r.totalTimeMinutes % 60) : "",
    sourceUrl: r.source?.reelUrl ?? "",
    creatorHandle: r.source?.creatorHandle,
    ingredientGroups: r.ingredientGroups,
    stepGroups: r.stepGroups,
    ingredients: r.ingredients.map((i) => ({
      id: i.id,
      groupId: i.groupId,
      name: i.name,
      amount: i.grams === null ? "" : String(i.grams),
      toTaste: i.status === "to-taste",
      status: i.status === "to-taste" ? "confirmed" : i.status,
      original: i.original,
      note: i.note,
    })),
    steps: r.steps.map((s) => ({ id: s.id, groupId: s.groupId, text: s.text, ingredientIds: s.ingredientIds })),
  };
}

function creatorFromUrl(url: string): string | undefined {
  return url.match(/instagram\.com\/([A-Za-z0-9._]+)\/(?:reel|p)\//)?.[1];
}

/** The saved recipe's content; callers add identity and history (id, rating, log…). */
export function toRecipeContent(state: EditorState): Omit<Recipe, "id" | "rating" | "favorite" | "bakeLog" | "shareLink" | "createdAt"> {
  const keep = state.ingredients.filter((i) => i.name.trim() || i.amount.trim() || i.toTaste);
  const keptIds = new Set(keep.map((i) => i.id));
  const quantity = Math.max(1, Math.round(Number(state.yieldQuantity) || 1));
  const unitText = state.yieldUnit.trim() || "batch";
  // The owner may type either form ("loaf" or "loaves"); keep both.
  const one = singular(unitText);
  const yieldValue: RecipeYield = { quantity, unit: one, unitPlural: one === unitText ? plural(one) : unitText };
  const url = state.sourceUrl.trim();
  const handle = state.creatorHandle ?? creatorFromUrl(url);
  return {
    title: state.title.trim(),
    category: state.category as Category,
    yield: yieldValue,
    totalTimeMinutes: (Number(state.hours) || 0) * 60 + (Number(state.minutes) || 0),
    source: url ? { creatorHandle: handle ?? "source", reelUrl: url } : undefined,
    ingredientGroups: state.ingredientGroups.filter((g) => keep.some((i) => i.groupId === g.id)),
    stepGroups: state.stepGroups.filter((g) => state.steps.some((s) => s.groupId === g.id && s.text.trim())),
    ingredients: keep.map((i) => ({
      id: i.id,
      groupId: i.groupId,
      name: i.name.trim(),
      grams: i.toTaste ? null : parseGrams(i.amount),
      status: i.toTaste ? "to-taste" : i.status,
      original: i.status === "converted" ? i.original : undefined,
      note: i.note?.trim() || undefined,
    })),
    steps: state.steps
      .filter((s) => s.text.trim())
      .map((s) => ({ id: s.id, groupId: s.groupId, text: s.text.trim(), timeMarks: detectTimes(s.text), ingredientIds: s.ingredientIds.filter((id) => keptIds.has(id)) })),
  };
}

// ── Suggested component groups (SKELETON Recipe editor template) ──

export const GROUP_SUGGESTIONS: { label: string; names: string[] }[] = [
  { label: "Breads and doughs", names: ["Preferment", "Starter", "Soaker", "Dough", "Butter block", "Egg wash", "Topping"] },
  { label: "Cakes", names: ["Batter", "Sponge", "Soaking syrup", "Filling", "Frosting", "Buttercream", "Ganache", "Glaze", "Decoration"] },
  { label: "Pies and tarts", names: ["Crust", "Base", "Filling", "Streusel", "Topping"] },
  { label: "Creams and extras", names: ["Pastry cream", "Custard", "Curd", "Meringue", "Caramel", "Icing"] },
];

/** Add step group: the recipe's ingredient group names first, then Assembly, Baking, Finishing, and Tips when the recipe has none (BONES-import-detail 1.4.2). */
export function stepGroupSuggestions(state: EditorState): { label: string; names: string[] }[] {
  const fromIngredients = state.ingredientGroups.map((g) => g.name);
  const hasTips = state.stepGroups.some((g) => g.name === "Tips");
  return [
    ...(fromIngredients.length ? [{ label: "This recipe's ingredient groups", names: fromIngredients }] : []),
    { label: "Steps only", names: [...["Assembly", "Baking", "Finishing"], ...(hasTips ? [] : ["Tips"])] },
  ];
}
