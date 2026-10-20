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

function yieldParts(y: RecipeYield, scale: number) {
  const exact = y.quantity * scale;
  const rounded = Math.max(1, Math.round(exact));
  const approximate = Math.abs(rounded - exact) > 1e-9;
  const unit = rounded === 1 ? y.unit : y.unitPlural;
  return { rounded, unit, approximate };
}

/** "Makes 12 tarts", "Makes about 16 tarts", "Makes 1 loaf" (SKELETON 1.3.1). */
export function formatYield(y: RecipeYield, scale: number): string {
  const { rounded, unit, approximate } = yieldParts(y, scale);
  return `Makes ${approximate ? "about " : ""}${rounded} ${unit}`;
}

/** "12 tarts", "about 16 tarts" — the record-card yield row, whose "yield" label already says "Makes". */
export function formatYieldCompact(y: RecipeYield, scale: number): string {
  const { rounded, unit, approximate } = yieldParts(y, scale);
  return `${approximate ? "about " : ""}${rounded} ${unit}`;
}

/** "3 h 30 min", "45 min", "2 h". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** "3 h 40", "45 min", "2 h" — the record-card yield row's compact time (no "min" once "h" already marks it as a duration). */
export function formatDurationCompact(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m}`;
}

/** "Sat 26 Sep", with the year when it isn't the current one. */
export function formatBakeDate(isoDate: string, today: Date = new Date()): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mo - 1];
  return `${weekday} ${d} ${month}${y === today.getFullYear() ? "" : ` ${y}`}`;
}

/** "28 Sep" — no weekday, for compact spots like recipe-tile's meta line, where "Baked Mon 28 Sep" wraps at 390px. */
export function formatShortDate(isoDate: string, today: Date = new Date()): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mo - 1];
  return `${d} ${month}${y === today.getFullYear() ? "" : ` ${y}`}`;
}

/** "13 Oct" (the year only when it isn't the current one) — BONES-import "Import key created". */
export function formatKeyDate(isoTimestamp: string, today: Date = new Date()): string {
  const d = new Date(isoTimestamp);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  return `${d.getUTCDate()} ${month}${d.getUTCFullYear() === today.getFullYear() ? "" : ` ${d.getUTCFullYear()}`}`;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "15" and "Thu" — a bake-row's date-block lead (its day and weekday, stacked). */
export function formatTileDate(isoDate: string): { day: string; weekday: string } {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  return { day: String(d), weekday };
}

/** "Saturday 26 September", with the year when it isn't the current one — a bake-row's accessible name. */
export function formatFullBakeDate(isoDate: string, today: Date = new Date()): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const weekday = WEEKDAY_NAMES[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  return `${weekday} ${d} ${MONTH_NAMES[mo - 1]}${y === today.getFullYear() ? "" : ` ${y}`}`;
}

/** "October", with the year when it isn't the current one — the Bakes diary's month chapter headings. */
export function formatMonthHeading(year: number, month: number, today: Date = new Date()): string {
  return year === today.getFullYear() ? MONTH_NAMES[month] : `${MONTH_NAMES[month]} ${year}`;
}

export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
