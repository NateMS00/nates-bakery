import type { AmountPart } from "./grams";

// Turns Apple Intelligence's reply (docs/shortcut-prompt.txt) into a recipe the app
// can trust. The model gets things wrong in ways a prompt alone couldn't stop, found
// against six real reel captions (round 1, 2026-10-13/14):
// - one amount written two ways ("1 cup (227 g)") came back as two parts, which would
//   double the grams if both were converted (`dedupeParts`);
// - "amount" didn't always come from the caption at all ("12 piezas" for "12 yemas"),
//   so it's dropped unless it's actually in there (`inCaption`);
// - empty ingredient and step groups appeared, copied from this prompt's own example
//   (`dropEmpty`);
// - an extra top-level key or a stray "recipe": true showed up (ignored: only the
//   fields below are ever read);
// - two captions' JSON was simply broken (a dropped character). `extractRecipe`
//   never throws on bad input; a reply that doesn't parse, or where any group, item,
//   or step doesn't have the shape the prompt asked for, is reported as "malformed"
//   (with a `reason` for Vercel's logs) rather than guessed at or partially used;
// - a reply wrapped in a markdown code fence (```json ... ```) is tolerated and
//   unwrapped before parsing, a known quirk of asking a chat model for JSON.

export interface ExtractedIngredient {
  name: string;
  /** Null unless this exact text is in the caption; never invented or translated. */
  amount: string | null;
  parts: AmountPart[];
  note: string | null;
}

export interface ExtractedStep {
  text: string;
  uses: string[];
}

export interface ExtractedGroup<Item> {
  name: string | null;
  items: Item[];
}

export interface ExtractedYield {
  quantity: number;
  unit: string;
  unitPlural: string;
}

export interface ExtractedTotalTime {
  hours: number;
  minutes: number;
}

export interface ExtractedRecipe {
  language: string | null;
  title: string | null;
  category: string | null;
  yield: ExtractedYield | null;
  totalTime: ExtractedTotalTime | null;
  ingredientGroups: ExtractedGroup<ExtractedIngredient>[];
  /** The last group named "Tips" (if any) is always moved to the end. */
  stepGroups: ExtractedGroup<ExtractedStep>[];
}

export type ExtractResult =
  | { status: "ok"; recipe: ExtractedRecipe }
  /** The model replied {"recipe": false}: no recipe in this caption. */
  | { status: "no-recipe" }
  /** The reply wasn't valid JSON, or didn't have the shape the prompt asked for.
   * `reason` is for Vercel's function logs (handleFinishImport), not shown to the
   * owner — a real production "retry" is otherwise undiagnosable after the fact,
   * since the Shortcut's exact reply is never stored anywhere once it's rejected. */
  | { status: "malformed"; reason: string };

const WEIGHT_UNITS = new Set(["g", "kg", "oz", "lb"]);
const METRIC_WEIGHT_UNITS = new Set(["g", "kg"]);

/**
 * One amount is one amount, when the model still writes it two ways: a weight next
 * to a volume, a count, or a can or stick ("1 cup (227 g)", "1 (14 oz) can",
 * "125 g (1 barrita)"), or two weights ("8 oz (225 g)"). Keep the metric weight (g or
 * kg) when one was given, otherwise the first form written. Two volumes, or a count
 * and a can, with no weight anywhere ("½ cup + 1 tbsp") are a real combined amount
 * and are left alone, so grams.ts still adds them.
 */
export function dedupeParts(parts: AmountPart[]): AmountPart[] {
  if (parts.length <= 1) return parts;
  if (!parts.some((p) => WEIGHT_UNITS.has(p.unit))) return parts;
  const metric = parts.filter((p) => METRIC_WEIGHT_UNITS.has(p.unit));
  return metric.length ? [metric[0]] : [parts[0]];
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Whether `amount`'s exact words (loosely: case, accents, spacing) are in the caption. */
export function inCaption(amount: string, caption: string): boolean {
  return normalize(caption).includes(normalize(amount));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function readYield(v: unknown): ExtractedYield | null {
  if (v === null) return null;
  if (!isRecord(v)) return null;
  const { quantity, unit, unitPlural } = v;
  if (typeof quantity !== "number" || typeof unit !== "string" || typeof unitPlural !== "string") return null;
  return { quantity, unit, unitPlural };
}

function readTotalTime(v: unknown): ExtractedTotalTime | null {
  if (v === null) return null;
  if (!isRecord(v)) return null;
  const { hours, minutes } = v;
  if (typeof hours !== "number" || typeof minutes !== "number") return null;
  return { hours, minutes };
}

function readParts(v: unknown): AmountPart[] | null {
  if (!Array.isArray(v)) return null;
  const parts: AmountPart[] = [];
  for (const p of v) {
    if (!isRecord(p)) return null;
    const { unit, qty } = p;
    if (typeof unit !== "string") return null;
    if (qty !== null && typeof qty !== "string") return null;
    parts.push({ qty, unit });
  }
  return parts;
}

function readIngredient(raw: unknown, caption: string): ExtractedIngredient | null {
  if (!isRecord(raw)) return null;
  const name = readString(raw.name);
  const parts = readParts(raw.parts);
  if (name === null || parts === null) return null;
  const written = readString(raw.amount);
  const amount = written && inCaption(written, caption) ? written : null;
  return { name, amount, parts: dedupeParts(parts), note: readString(raw.note) };
}

function readStep(raw: unknown): ExtractedStep | null {
  if (!isRecord(raw)) return null;
  const text = raw.text;
  const uses = raw.uses;
  if (typeof text !== "string" || !text.trim()) return null;
  if (!Array.isArray(uses) || !uses.every((u) => typeof u === "string")) return null;
  return { text, uses };
}

function readGroups<Item>(value: unknown, itemsKey: "items" | "steps", readItem: (raw: unknown) => Item | null): ExtractedGroup<Item>[] | null {
  if (!Array.isArray(value)) return null;
  const groups: ExtractedGroup<Item>[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) return null;
    const list = raw[itemsKey];
    if (!Array.isArray(list)) return null;
    const items: Item[] = [];
    for (const rawItem of list) {
      const item = readItem(rawItem);
      if (item === null) return null;
      items.push(item);
    }
    groups.push({ name: readString(raw.name), items });
  }
  return groups;
}

/** Drops groups with no items — the model's own example groups, copied when empty. */
function dropEmpty<Item>(groups: ExtractedGroup<Item>[]): ExtractedGroup<Item>[] {
  return groups.filter((g) => g.items.length > 0);
}

/** SKELETON 1.4.4: tips land in one group named "Tips", always last. */
function moveTipsLast(groups: ExtractedGroup<ExtractedStep>[]): ExtractedGroup<ExtractedStep>[] {
  const isTips = (g: ExtractedGroup<ExtractedStep>) => g.name?.trim().toLowerCase() === "tips";
  const tips = groups.filter(isTips);
  const rest = groups.filter((g) => !isTips(g));
  return tips.length ? [...rest, ...tips] : groups;
}

/**
 * Apple Intelligence sometimes wraps its reply in a markdown code fence
 * (```json ... ``` or ``` ... ```), a known quirk of asking a chat model for JSON.
 * The prompt doesn't ask for this, but stripping it costs nothing and a reply that's
 * genuinely broken still fails to parse afterwards.
 */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const match = /^```[^\n]*\n([\s\S]*?)\n?```$/.exec(trimmed);
  return match ? match[1].trim() : trimmed;
}

export function extractRecipe(reply: string, caption: string): ExtractResult {
  let raw: unknown;
  try {
    raw = JSON.parse(stripCodeFence(reply));
  } catch (err) {
    return { status: "malformed", reason: err instanceof Error ? err.message : "invalid JSON" };
  }
  if (!isRecord(raw)) return { status: "malformed", reason: "the reply's top level isn't a JSON object" };
  if (raw.recipe === false) return { status: "no-recipe" };

  const ingredientGroups = readGroups(raw.ingredientGroups, "items", (r) => readIngredient(r, caption));
  const stepGroups = readGroups(raw.stepGroups, "steps", readStep);
  if (ingredientGroups === null) return { status: "malformed", reason: "ingredientGroups didn't match the expected shape" };
  if (stepGroups === null) return { status: "malformed", reason: "stepGroups didn't match the expected shape" };

  return {
    status: "ok",
    recipe: {
      language: readString(raw.language),
      title: readString(raw.title),
      category: readString(raw.category),
      yield: readYield(raw.yield),
      totalTime: readTotalTime(raw.totalTime),
      ingredientGroups: dropEmpty(ingredientGroups),
      stepGroups: moveTipsLast(dropEmpty(stepGroups)),
    },
  };
}
