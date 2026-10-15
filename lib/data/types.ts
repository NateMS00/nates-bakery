// The Nate’s Bakery data model. No backend yet: fixtures in lib/data/fixtures.ts feed it.

export type Category =
  | "bread"
  | "viennoiserie"
  | "quick-bread"
  | "cake"
  | "cookie-bar"
  | "pie-tart"
  | "pastry"
  | "dessert"
  | "other";

/**
 * How sure we are of an amount. "missing" is not here on purpose: a saved recipe
 * can't have one (SKELETON FLOW-01 blocks saving), so it only belongs to drafts.
 * "to-taste" is an amount state, not a marker (SKELETON 1.3.1).
 */
export type AmountStatus = "confirmed" | "estimated" | "converted" | "to-taste";

export interface Group {
  id: string;
  /** Free text; SKELETON's component group list is suggested, not enforced. */
  name: string;
}

export interface Ingredient {
  id: string;
  /** Ingredient groups are their own list, separate from step groups. */
  groupId: string | null;
  name: string;
  /** Grams at 1×. Null only when status is "to-taste". */
  grams: number | null;
  status: AmountStatus;
  /** The stated amount before conversion, kept while status is "converted". */
  original?: string;
  /**
   * A remark about this ingredient: what the creator said ("Creator: 100 g makes it
   * less sweet"), or the owner's own. Never on shared pages (BONES-r-detail).
   */
  note?: string;
}

export interface TimeMark {
  /** Exactly as it appears in the step text, e.g. "25 minutes". */
  text: string;
  /** Drives the Bake Mode timer. */
  minutes: number;
}

export interface Step {
  id: string;
  groupId: string | null;
  text: string;
  /** Zero or more; each becomes its own timer in Bake Mode. */
  timeMarks: TimeMark[];
  /** Ingredients this step uses, shown with the step in Bake Mode. */
  ingredientIds: string[];
}

export interface BakeLogEntry {
  id: string;
  /** ISO date (YYYY-MM-DD). The only required field. */
  date: string;
  scale: number;
  whatChanged?: string;
  howItTurnedOut?: string;
}

export interface ShareLink {
  token: string;
  createdAt: string;
}

export interface RecipeYield {
  quantity: number;
  unit: string;
  unitPlural: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: Category;
  yield: RecipeYield;
  totalTimeMinutes: number;
  /** Absent for recipes entered by hand. */
  source?: {
    creatorHandle: string;
    reelUrl: string;
    /** The Storage path behind `picture` (SKELETON 1.4.6). save_recipe keeps the
     * existing one when this is absent, so editing never clears it. */
    thumbnailPath?: string;
  };
  /** The reel thumbnail, copied into the app's own storage (SKELETON 1.4.2). Null for a
   * hand-entered recipe or a failed copy; the Library and Recipe page show the picture
   * placeholder either way. Not on shared pages. */
  picture: string | null;
  ingredientGroups: Group[];
  stepGroups: Group[];
  ingredients: Ingredient[];
  /** In order; numbering is continuous across groups. */
  steps: Step[];
  /** 1–5, or null when unrated. */
  rating: number | null;
  /** Private: never shown on shared pages. */
  favorite: boolean;
  /** Newest first. Baked is derived: bakeLog.length > 0. */
  bakeLog: BakeLogEntry[];
  /** One revocable link per recipe; null when not shared. */
  shareLink: ShareLink | null;
  createdAt: string;
}

/** An unsaved import (SKELETON FLOW-01). */
export interface Draft {
  id: string;
  /** "failed" (SKELETON 1.4.5, "Couldn't finish"): the caption arrived but the recipe never did. */
  status: "importing" | "ready" | "failed";
  /** Null until the extraction has found one; shown as "@creator's reel". */
  title: string | null;
  creatorHandle: string;
  reelUrl: string;
  createdAt: string;
  /** When a stubbed import started (ms); it becomes ready SIMULATED_IMPORT_MS later. */
  startedAt?: number;
  /** The automatic retry-once (SKELETON 1.4.5) has already run for this draft. */
  retried?: boolean;
  /** The post text exactly as the creator wrote it. Absent only while "importing". */
  caption?: string;
  /** True when Instagram's length limit cut the caption off. */
  captionCutOff?: boolean;
  /** The caption's own language, in English ("Spanish"); absent or "English" shows no "Translated from" label. */
  captionLanguage?: string;
  /**
   * The reel's thumbnail, straight from Apify (SKELETON 1.4.6). Expires after a few
   * days; copied into the app's own Storage the first time the draft is opened
   * (content.thumbnailPath), not kept as the picture source itself.
   */
  thumbnailUrl?: string;
  /**
   * The copied thumbnail (content.thumbnailPath), as a signed URL ready to display
   * (SKELETON 1.4.6) — set once the first-open copy has run and succeeded. Absent
   * otherwise (still importing, the copy hasn't run yet, or it failed); Source shows
   * its placeholder either way, the same as a hand-entered recipe's picture.
   */
  picture?: string | null;
  /** The extracted recipe, edited in Review Import and autosaved here. Ready drafts only. */
  content?: import("./editor").EditorState;
}

/**
 * What a friend's browser receives for /r/:shareToken: only what the page shows, so
 * nothing private (bake log, favorite, the owner's recipe id) leaves the server.
 */
export type SharedRecipe = Pick<
  Recipe,
  "title" | "category" | "yield" | "totalTimeMinutes" | "source" | "ingredientGroups" | "stepGroups" | "ingredients" | "steps" | "rating"
> & { sharedBy: string };
