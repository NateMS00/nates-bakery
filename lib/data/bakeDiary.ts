import type { BakeLogEntry } from "./types";

// Pure Bakes-diary logic (BONES-bakes.md), kept apart from lib/data/bakes.ts's
// getBakeDiary(): that fetcher pulls in the backend (lib/backend, next/headers),
// which can't reach the client component that renders this page (BakesView),
// the same split lib/data/bakeLog.ts already keeps from lib/data/recipes.ts.

/** One bake, flattened out of its recipe for the Bakes diary. */
export interface DiaryEntry {
  recipeId: string;
  recipeTitle: string;
  entry: BakeLogEntry;
  /** This bake's place among its recipe's bakes, counting from the first (1). */
  ordinal: number;
}

/** Newest first across every recipe; ties keep the recipe's own order, for a stable sort. */
export function sortDiary(entries: DiaryEntry[]): DiaryEntry[] {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.entry.date.localeCompare(a.e.entry.date) || a.i - b.i)
    .map(({ e }) => e);
}

/** "7 bakes this year · 5 recipes" (BONES-bakes.md page header). */
export function diarySummary(entries: DiaryEntry[], today: Date = new Date()): { count: number; recipes: number } {
  const year = today.getFullYear();
  const thisYear = entries.filter((e) => Number(e.entry.date.slice(0, 4)) === year);
  return { count: thisYear.length, recipes: new Set(thisYear.map((e) => e.recipeId)).size };
}

/** A run of photo bakes (the grid), or one photo-less bake (a full-width row) — BONES: tiles and rows keep date order between them. */
export type DiaryBlock = { kind: "tiles"; items: DiaryEntry[] } | { kind: "row"; item: DiaryEntry };

export interface MonthGroup {
  /** "2026-10", for a stable React key. */
  key: string;
  year: number;
  /** 0-11 */
  month: number;
  entries: DiaryEntry[];
  blocks: DiaryBlock[];
}

function toBlocks(entries: DiaryEntry[]): DiaryBlock[] {
  const blocks: DiaryBlock[] = [];
  let tiles: DiaryEntry[] = [];
  const flushTiles = () => {
    if (tiles.length > 0) blocks.push({ kind: "tiles", items: tiles });
    tiles = [];
  };
  for (const diaryEntry of entries) {
    if (diaryEntry.entry.photo) tiles.push(diaryEntry);
    else {
      flushTiles();
      blocks.push({ kind: "row", item: diaryEntry });
    }
  }
  flushTiles();
  return blocks;
}

/** Groups an already newest-first slice of the diary into month chapters, newest first. */
export function groupDiaryByMonth(entries: DiaryEntry[]): MonthGroup[] {
  const groups: Omit<MonthGroup, "blocks">[] = [];
  for (const diaryEntry of entries) {
    const [y, mo] = diaryEntry.entry.date.split("-").map(Number);
    const month = mo - 1;
    const last = groups[groups.length - 1];
    if (last && last.year === y && last.month === month) last.entries.push(diaryEntry);
    else groups.push({ key: `${y}-${mo}`, year: y, month, entries: [diaryEntry] });
  }
  return groups.map((g) => ({ ...g, blocks: toBlocks(g.entries) }));
}
