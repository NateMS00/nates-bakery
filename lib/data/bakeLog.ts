import type { BakeLogEntry } from "./types";

/** Newest first by date; on the same date, the entry earlier in the list stays first. */
export function sortLog(entries: BakeLogEntry[]): BakeLogEntry[] {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.date.localeCompare(a.e.date) || a.i - b.i)
    .map(({ e }) => e);
}

/** "1 bake", "5 bakes". */
export function bakeCount(n: number): string {
  return n === 1 ? "1 bake" : `${n} bakes`;
}
