import localFont from "next/font/local";

// Self-hosted per SKIN.md Font Import: variable woff2, Latin subset, font-display swap.
// Generated from design-reference/fonts with fontTools (axes limited, WONK pinned at 1).
// Only the two faces in the first viewport are preloaded.

export const fraunces = localFont({
  src: "./fonts/Fraunces.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-fraunces",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

export const frauncesItalic = localFont({
  src: "./fonts/Fraunces-Italic.woff2",
  weight: "300 700",
  style: "italic",
  display: "swap",
  preload: false,
  variable: "--font-fraunces-italic",
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

export const fontVariables = [fraunces, frauncesItalic, atkinsonNext, atkinsonMono]
  .map((font) => font.variable)
  .join(" ");
