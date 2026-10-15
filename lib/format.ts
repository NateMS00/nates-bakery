import type { RecipeYield } from "./data/types";

export const SCALE_MIN = 0.25;
export const SCALE_MAX = 10;
export const SCALE_PRESETS = [0.5, 1, 1.5, 2] as const;

/** Parses `?scale=`. Invalid values fall back to 1× with valid: false, so the page can correct the URL (BONES). */
export function parseScale(raw: string | string[] | undefined): { scale: number; valid: boolean } {
  if (raw === undefined) return { scale: 1, valid: true };
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (value.trim() === "" || !Number.isFinite(n) || n < SCALE_MIN || n > SCALE_MAX) {
    return { scale: 1, valid: false };
  }
  return { scale: n, valid: true };
}

/** "½×", "1×", "1.5×", "1.25×". */
export function formatScale(scale: number): string {
  if (scale === 0.5) return "½×";
  return `${formatNumber(scale)}×`;
}

function formatNumber(n: number): string {
  return String(Math.round(n * 100) / 100);
}

/** Grams: whole numbers; under 10 g one decimal, only when it isn't zero ("3.5", "8"). */
export function formatGrams(grams: number): string {
  if (grams < 10) return String(Math.round(grams * 10) / 10);
  return String(Math.round(grams));
}

/** "Makes 12 tarts", "Makes about 16 tarts", "Makes 1 loaf" (SKELETON 1.3.1). */
export function formatYield(y: RecipeYield, scale: number): string {
  const exact = y.quantity * scale;
  const rounded = Math.max(1, Math.round(exact));
  const approximate = Math.abs(rounded - exact) > 1e-9;
  const unit = rounded === 1 ? y.unit : y.unitPlural;
  return `Makes ${approximate ? "about " : ""}${rounded} ${unit}`;
}

/** "3 h 30 min", "45 min", "2 h". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** "Sat 26 Sep", with the year when it isn't the current one. */
export function formatBakeDate(isoDate: string, today: Date = new Date()): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mo - 1];
  return `${weekday} ${d} ${month}${y === today.getFullYear() ? "" : ` ${y}`}`;
}

/** "13 Oct" (the year only when it isn't the current one) — BONES-import "Import key created". */
export function formatKeyDate(isoTimestamp: string, today: Date = new Date()): string {
  const d = new Date(isoTimestamp);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  return `${d.getUTCDate()} ${month}${d.getUTCFullYear() === today.getFullYear() ? "" : ` ${d.getUTCFullYear()}`}`;
}

export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
