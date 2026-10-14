// Quantities as written in a caption, copied by Apple Intelligence into "qty"
// (docs/shortcut-prompt.txt): "1", "½", "2 ½", "2½", "1 1/2", "1-1/2", "2,5", "2-3",
// "2 to 3", "a", "una". Pure: no conversion here, just the number.

const FRACTIONS: Record<string, number> = {
  "½": 1 / 2,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅕": 1 / 5,
  "⅖": 2 / 5,
  "⅗": 3 / 5,
  "⅘": 4 / 5,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};

/** Number words, in the languages captions most often come in. */
const WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, half: 0.5,
  un: 1, una: 1, uno: 1, dos: 2, tres: 3, medio: 0.5, media: 0.5,
  um: 1, uma: 1, meio: 0.5, meia: 0.5,
  une: 1, demi: 0.5, demie: 0.5,
};

/** One number: "2", "2,5", "½", "2 ½", "2½", "1 1/2", "1-1/2", "3/4". */
function single(text: string): number | null {
  const t = text.trim().replace(/⁄/g, "/"); // fraction slash
  if (!t) return null;
  const word = WORDS[t.toLowerCase()];
  if (word !== undefined) return word;
  // whole + unicode fraction: "2 ½", "2½"
  let m = t.match(/^(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/);
  if (m) return Number(m[1]) + FRACTIONS[m[2]];
  if (t.length === 1 && FRACTIONS[t] !== undefined) return FRACTIONS[t];
  // whole + fraction: "1 1/2", "1-1/2"
  m = t.match(/^(\d+)[\s-]+(\d+)\/(\d+)$/);
  if (m && Number(m[3])) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = t.match(/^(\d+)\/(\d+)$/);
  if (m && Number(m[2])) return Number(m[1]) / Number(m[2]);
  // decimal, with a comma or a point: "2,5", "0.75"
  m = t.match(/^(\d+(?:[.,]\d+)?)$/);
  if (m) return Number(m[1].replace(",", "."));
  return null;
}

/**
 * The number in a written quantity, or null when there's none to read. A range ("2-3",
 * "2 to 3", "2 a 3") gives its first number; the original amount is kept with the
 * ingredient, so the owner sees the range.
 */
export function parseQuantity(qty: string | null | undefined): number | null {
  if (qty == null) return null;
  const t = qty.trim();
  const whole = single(t);
  if (whole !== null) return whole > 0 ? whole : null;
  // A range: split on a dash or "to/a/à" between two numbers, but not "1-1/2".
  const range = t.match(/^(.+?)\s*(?:–|—|-|\bto\b|\ba\b|\bà\b|\bou\b|\bor\b|\bo\b)\s*(.+)$/i);
  if (range) {
    const first = single(range[1]);
    if (first !== null && single(range[2]) !== null) return first > 0 ? first : null;
  }
  return null;
}
