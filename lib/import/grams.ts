import { parseQuantity } from "./quantity";

// Grams for an imported ingredient (SKELETON 1.4.2 FLOW-01 step 4). The app converts,
// never the AI, so the same amount always converts the same way and a wrong value is
// fixed here, once.
//
// Results (BONES-import-detail 1.4.1):
// - g, kg, mg: the amount as given, no marker.
// - Volumes (cup, tbsp, tsp, ml, l, fl oz) and imperial weights (oz, lb): Converted.
// - Counts and packages (an egg, a stick or barra of butter, a can, a packet) and a
//   pinch: Estimated, at a typical weight.
// - "To taste": To taste.
// - No amount, or an ingredient or unit this table doesn't know: Missing, never a
//   guess. An amount that was written is kept ("Add grams · was ½ cup"), and `unknown`
//   tells the caller to log the name so the table can grow.

export const UNITS = ["g", "kg", "mg", "ml", "l", "cup", "tbsp", "tsp", "oz", "lb", "fl_oz", "stick", "can", "packet", "piece", "pinch", "to_taste", "other"] as const;
export type Unit = (typeof UNITS)[number];

export interface AmountPart {
  /** The number as written ("2 ½", "1/2", "2-3"); null for "to taste". */
  qty: string | null;
  unit: Unit | string;
}

export interface ImportedAmount {
  /** The ingredient in English, as Apple Intelligence named it. */
  name: string;
  /** The amount exactly as written in the caption, in its own language ("½ taza + 1 cda"). */
  amount: string | null;
  parts: AmountPart[];
}

export type Conversion =
  | { status: "confirmed"; grams: number }
  | { status: "converted" | "estimated"; grams: number; original: string }
  | { status: "to-taste" }
  | { status: "missing"; original?: string; unknown?: boolean };

// ── The table ──
// Grams per US cup from King Arthur Baking's ingredient weight chart (checked
// 2026-10-13; tbsp = cup ÷ 16, tsp = cup ÷ 48, fl oz = cup ÷ 8). `gPerMl` only where
// King Arthur's rounded cup (8 oz for a cup of water) would put metric liquids off:
// 250 ml of water is 250 g. Typical weights for counts and packages are per item.

interface Entry {
  /** Ingredient names (in English) that mean this entry, after the cleanup in `words()`. */
  names: string[];
  gPerCup?: number;
  gPerMl?: number;
  each?: number;
  stick?: number;
  can?: number;
  packet?: number;
  /** Known, but too different by brand or type to convert (kosher salt): always Missing. */
  ambiguous?: true;
}

export const TABLE: Entry[] = [
  // Flours and starches
  { names: ["flour", "all purpose flour", "plain flour", "wheat flour", "white flour"], gPerCup: 120 },
  { names: ["bread flour", "strong flour", "strong white flour"], gPerCup: 120 },
  { names: ["cake flour"], gPerCup: 120 },
  { names: ["whole wheat flour", "wholemeal flour", "whole grain flour"], gPerCup: 113 },
  { names: ["almond flour", "almond meal", "ground almond"], gPerCup: 96 },
  { names: ["cornstarch", "corn starch", "cornflour"], gPerCup: 112 },
  { names: ["cornmeal", "yellow cornmeal", "polenta"], gPerCup: 156 },
  { names: ["rolled oat", "old fashioned oat", "old fashioned rolled oat", "oat", "oatmeal", "quick oat"], gPerCup: 89 },
  // Sugars and syrups
  { names: ["sugar", "white sugar", "caster sugar", "superfine sugar"], gPerCup: 198 },
  { names: ["brown sugar", "light brown sugar", "dark brown sugar"], gPerCup: 213 }, // packed
  { names: ["powdered sugar", "confectioner sugar", "confectioners sugar", "icing sugar"], gPerCup: 113 },
  { names: ["honey"], gPerCup: 336 },
  { names: ["maple syrup"], gPerCup: 312 },
  { names: ["corn syrup", "light corn syrup"], gPerCup: 312 },
  { names: ["molasses"], gPerCup: 340 },
  // Dairy and fats
  { names: ["butter"], gPerCup: 226, stick: 113 }, // ½ cup = 113 g = 1 US stick
  { names: ["vegetable oil", "oil", "canola oil", "sunflower oil", "neutral oil"], gPerCup: 198, gPerMl: 0.92 },
  { names: ["milk", "whole milk"], gPerCup: 227, gPerMl: 1.03 },
  { names: ["heavy cream", "cream", "whipping cream", "heavy whipping cream", "double cream"], gPerCup: 227, gPerMl: 1.0 },
  { names: ["water"], gPerCup: 227, gPerMl: 1.0 },
  { names: ["sour cream"], gPerCup: 227 },
  { names: ["yogurt", "greek yogurt", "yoghurt"], gPerCup: 227 },
  { names: ["cream cheese"], gPerCup: 227 },
  { names: ["sweetened condensed milk", "condensed milk"], gPerCup: 312, can: 395 },
  { names: ["evaporated milk"], gPerCup: 226, can: 354 },
  { names: ["coconut milk"], can: 400 },
  { names: ["peanut butter"], gPerCup: 270 },
  // Mix-ins
  { names: ["cocoa powder", "cocoa", "unsweetened cocoa powder", "unsweetened cocoa"], gPerCup: 84 },
  { names: ["chocolate chip", "semisweet chocolate chip", "bittersweet chocolate chip"], gPerCup: 170 },
  { names: ["chopped walnut", "walnut"], gPerCup: 113 },
  { names: ["chopped pecan", "pecan"], gPerCup: 114 },
  { names: ["shredded coconut", "sweetened shredded coconut"], gPerCup: 85 },
  { names: ["unsweetened shredded coconut"], gPerCup: 53 },
  // Leaveners, salt, flavourings
  { names: ["salt", "table salt", "fine salt"], gPerCup: 288 },
  { names: ["kosher salt", "flaky salt", "sea salt", "flaky sea salt", "coarse salt"], ambiguous: true },
  { names: ["baking powder"], gPerCup: 192 },
  { names: ["baking soda", "bicarbonate of soda", "bicarb"], gPerCup: 288 },
  // King Arthur lists instant yeast at 2¼ tsp = 7 g; active dry and a packet are the same.
  { names: ["instant yeast", "yeast", "active dry yeast", "dry yeast", "rapid rise yeast"], gPerCup: 149, packet: 7 },
  { names: ["vanilla extract", "vanilla"], gPerCup: 224 },
  // Not in King Arthur's chart: USDA FoodData Central, 1 tsp ground cinnamon ≈ 2.6 g.
  { names: ["ground cinnamon", "cinnamon"], gPerCup: 125 },
  { names: ["gelatin", "unflavored gelatin", "powdered gelatin"], packet: 7 },
  // Counted
  { names: ["egg", "whole egg"], each: 50 },
  { names: ["egg yolk", "yolk"], each: 14 },
  { names: ["egg white"], each: 32 }, // King Arthur: 30 to 35
  { names: ["banana", "ripe banana"], each: 120 },
];

/** A pinch of anything. */
export const PINCH_GRAMS = 0.5;

const ML_PER_CUP = 236.59;
const PER_CUP: Partial<Record<Unit, number>> = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48, fl_oz: 1 / 8 };
const ML: Partial<Record<Unit, number>> = { ml: 1, l: 1000 };
const MASS: Partial<Record<Unit, { grams: number; metric: boolean }>> = {
  g: { grams: 1, metric: true },
  kg: { grams: 1000, metric: true },
  mg: { grams: 0.001, metric: true },
  oz: { grams: 28.3495, metric: false },
  lb: { grams: 453.592, metric: false },
};

// Words that describe the state or the amount but not which ingredient it is.
const DESCRIPTORS = new Set(
  "sifted unsifted melted softened soft cold chilled warm hot lukewarm room temperature at unsalted salted packed firmly lightly large medium small extra fresh plain granulated unbleached pure all purpose finely roughly diced toasted cubed cubes cube softly beaten whisked divided optional plus more for dusting greasing sprinkling topping of the a an and or to about approximately organic full fat".split(" "),
);
// Keep "all purpose" as one meaning: both words are descriptors, so "all purpose flour" is "flour".

function singular(word: string): string {
  if (word === "molasses" || word === "ss" || word.endsWith("ss")) return word;
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
}

/** The words that name an ingredient: lower case, no accents or brackets, singular, no descriptors. */
export function words(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/['’]/g, "")
    .split(/[^a-z]+/)
    .filter(Boolean)
    .map(singular)
    .filter((w) => !DESCRIPTORS.has(w));
}

const key = (ws: string[]) => [...new Set(ws)].sort().join(" ");
const INDEX = new Map<string, Entry>();
for (const entry of TABLE) {
  for (const n of entry.names) {
    const k = key(words(n));
    if (INDEX.has(k) && INDEX.get(k) !== entry) throw new Error(`grams table: "${n}" names two entries`);
    INDEX.set(k, entry);
  }
}

/**
 * The table entry for an ingredient name: the same words as one of its names, in any
 * order, once descriptors are set aside. No partial matches, so "rice flour" is never
 * read as flour and "eggplant" never as egg.
 */
export function findEntry(name: string): Entry | null {
  const ws = words(name);
  return ws.length ? (INDEX.get(key(ws)) ?? null) : null;
}

/** Rounded like the app shows grams: one decimal under 10 g, whole grams from 10 g. */
export function roundGrams(grams: number): number {
  return grams < 10 ? Math.round(grams * 10) / 10 : Math.round(grams);
}

type PartResult = { grams: number; kind: "metric" | "converted" | "estimated" } | { kind: "missing"; unknown: boolean };

function convertPart(part: AmountPart, entry: Entry | null): PartResult {
  const unit = part.unit as Unit;
  const n = parseQuantity(part.qty);
  const mass = MASS[unit];
  if (mass) return n === null ? { kind: "missing", unknown: false } : { grams: n * mass.grams, kind: mass.metric ? "metric" : "converted" };
  if (unit === "pinch") return { grams: (n ?? 1) * PINCH_GRAMS, kind: "estimated" };
  if (n === null) return { kind: "missing", unknown: false };
  if (!UNITS.includes(unit) || unit === "other" || unit === "to_taste") return { kind: "missing", unknown: true };
  if (!entry || entry.ambiguous) return { kind: "missing", unknown: !entry };

  const perCup = PER_CUP[unit];
  if (perCup !== undefined) return entry.gPerCup ? { grams: n * perCup * entry.gPerCup, kind: "converted" } : { kind: "missing", unknown: true };
  const ml = ML[unit];
  if (ml !== undefined) {
    const gPerMl = entry.gPerMl ?? (entry.gPerCup ? entry.gPerCup / ML_PER_CUP : undefined);
    return gPerMl ? { grams: n * ml * gPerMl, kind: "converted" } : { kind: "missing", unknown: true };
  }
  const each = unit === "piece" ? entry.each : unit === "stick" ? entry.stick : unit === "can" ? entry.can : unit === "packet" ? entry.packet : undefined;
  return each ? { grams: n * each, kind: "estimated" } : { kind: "missing", unknown: true };
}

/** "½ cup + 1 tbsp" when the caption's own words weren't copied. */
function written(item: ImportedAmount): string | undefined {
  const text = item.amount?.trim();
  if (text) return text;
  const parts = item.parts.filter((p) => p.qty || p.unit !== "to_taste").map((p) => [p.qty, p.unit === "piece" ? "" : p.unit.replace("_", " ")].filter(Boolean).join(" "));
  return parts.length ? parts.join(" + ") : undefined;
}

export function toGrams(item: ImportedAmount): Conversion {
  const parts = item.parts.filter((p) => p.unit !== "to_taste");
  if (item.parts.length > 0 && parts.length === 0) return { status: "to-taste" };
  const original = written(item);
  if (parts.length === 0) return original ? { status: "missing", original } : { status: "missing" };

  const entry = findEntry(item.name);
  const results = parts.map((p) => convertPart(p, entry));
  const missing = results.find((r) => r.kind === "missing");
  if (missing) return { status: "missing", ...(original ? { original } : {}), ...(missing.kind === "missing" && missing.unknown ? { unknown: true } : {}) };

  const grams = roundGrams(results.reduce((sum, r) => sum + (r.kind === "missing" ? 0 : r.grams), 0));
  if (results.some((r) => r.kind === "estimated")) return { status: "estimated", grams, original: original! };
  if (results.some((r) => r.kind === "converted")) return { status: "converted", grams, original: original! };
  return { status: "confirmed", grams };
}
