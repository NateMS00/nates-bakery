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

export interface MonthGroup {
  /** "2026-10", for a stable React key. */
  key: string;
  year: number;
  /** 0-11 */
  month: number;
  /** Every bake-row in this month, newest first (BONES-bakes 1.2.0: no photo grid). */
  entries: DiaryEntry[];
}

/** Groups an already newest-first slice of the diary into month chapters, newest first. */
export function groupDiaryByMonth(entries: DiaryEntry[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const diaryEntry of entries) {
    const [y, mo] = diaryEntry.entry.date.split("-").map(Number);
    const month = mo - 1;
    const last = groups[groups.length - 1];
    if (last && last.year === y && last.month === month) last.entries.push(diaryEntry);
    else groups.push({ key: `${y}-${mo}`, year: y, month, entries: [diaryEntry] });
  }
  return groups;
}
