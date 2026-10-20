import localFont from "next/font/local";

// Self-hosted per SKIN.md Font Import: variable woff2, Latin subset, font-display swap.
// Generated from design-reference/fonts with fontTools (axes limited, WONK pinned at 1).
// Only the two faces in the first viewport are preloaded.

export const fraunces = localFont({
  src: "./fonts/Fraunces.woff2",
  weight: "300 900",
  style: "normal",
  display: "swap",
  variable: "--font-fraunces",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

export const frauncesItalic = localFont({
  src: "./fonts/Fraunces-Italic.woff2",
  weight: "300 900",
  style: "italic",
  display: "swap",
  preload: false,
  variable: "--font-fraunces-italic",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

// SKIN bake-step-number: a static instance (wght 900, opsz 144, SOFT 100, WONK 1),
// digits only, with fontTools' instancer --remove-overlaps. The variable font's own
// overlapping contours draw stray inner strokes with -webkit-text-stroke (visible in
// "2" and "5"); a static, overlap-free outline doesn't have that problem.
export const frauncesBakeNumber = localFont({
  src: "./fonts/Fraunces-Black-BakeNumber.woff2",
  weight: "900",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-fraunces-bake-number",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

export const atkinsonNext = localFont({
  src: "./fonts/AtkinsonHyperlegibleNext.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-atkinson-next",
  fallback: ["Avenir Next", "system-ui", "sans-serif"],
});

export const atkinsonMono = localFont({
  src: "./fonts/AtkinsonHyperlegibleMono.woff2",
  weight: "400 700",
  display: "swap",
  preload: false,
  variable: "--font-atkinson-mono",
  fallback: ["SF Mono", "ui-monospace", "monospace"],
});

export const fontVariables = [fraunces, frauncesItalic, frauncesBakeNumber, atkinsonNext, atkinsonMono]
  .map((font) => font.variable)
  .join(" ");
