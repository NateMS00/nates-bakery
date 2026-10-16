// Generates styles/tokens.css from the YAML front matter of SKIN.md.
// Run with `npm run theme` whenever SKIN.md changes. Never edit tokens.css by hand.
//
// Output:
// - A Tailwind v4 @theme block with SKIN's token names, so `bg-canvas`, `text-ink`,
//   `rounded-md`, `p-base`, `min-h-touch-min`, `shadow-float` all resolve through
//   CSS custom properties. Tailwind's default palette, radii, and breakpoints are
//   cleared, so only SKIN values exist.
// - The `colors-dark` values under `prefers-color-scheme: dark`, same names.
// - One `type-*` utility per typography role (family, size, weight, line height,
//   tracking, features), because a SKIN role bundles more than one Tailwind axis.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skin = readFileSync(resolve(root, "SKIN.md"), "utf8");
const match = skin.match(/^---\n([\s\S]*?)\n---/);
if (!match) throw new Error("SKIN.md has no YAML front matter");
const t = yaml.load(match[1]);

// SKIN font family names → the CSS variables next/font/local defines in app/fonts.ts.
const FACES = {
  Fraunces: { normal: "--font-fraunces", italic: "--font-fraunces-italic" },
  "Atkinson Hyperlegible Next": { normal: "--font-atkinson-next" },
  "Atkinson Hyperlegible Mono": { normal: "--font-atkinson-mono" },
};

const ref = (value) =>
  String(value).replace(/\{(\w+)\.([\w-]+)\}/g, (_, group, name) => {
    const prefix = { colors: "color", spacing: "spacing", rounded: "radius", sizing: "spacing" }[group];
    if (!prefix) throw new Error(`Unresolvable token reference {${group}.${name}}`);
    return `var(--${prefix}-${name})`;
  });

const px = (v) => (typeof v === "number" ? `${v}px` : v);

function family(stack, italic) {
  const [first, ...rest] = stack.split(",").map((s) => s.trim());
  const name = first.replace(/['"]/g, "");
  const face = FACES[name];
  if (!face) throw new Error(`No self-hosted face for ${name}`);
  const variable = italic && face.italic ? face.italic : face.normal;
  return [`var(${variable})`, ...rest].join(", ");
}

const lines = [];
const out = (s = "") => lines.push(s);

out("/* Generated from SKIN.md by scripts/generate-theme.mjs. Do not edit by hand. */");
out();
out("@theme {");
out("  --color-*: initial;");
out("  --radius-*: initial;");
out("  --shadow-*: initial;");
out("  --breakpoint-*: initial;");
out("  --font-*: initial;");
out();
for (const [name, value] of Object.entries(t.colors)) out(`  --color-${name}: ${value};`);
out();
for (const [name, value] of Object.entries(t.rounded)) out(`  --radius-${name}: ${px(value)};`);
out();
out("  /* 4px base unit; use the named steps below in components. */");
out("  --spacing: 4px;");
for (const [name, value] of Object.entries(t.spacing)) out(`  --spacing-${name}: ${px(value)};`);
out();
out("  /* SKIN sizing, in the spacing namespace so h-*, w-*, min-h-*, max-w-* accept them. */");
for (const [name, value] of Object.entries(t.sizing)) out(`  --spacing-${name}: ${px(value)};`);
out();
out("  --shadow-float: " + ref(t.elevation.float) + ";");
out("  --shadow-bar: " + ref(t.elevation.bar) + ";");
out();
out("  /* SKIN breakpoints: tablet 768–1279, desktop 1280 and up. */");
out("  --breakpoint-tablet: 768px;");
out("  --breakpoint-desktop: 1280px;");
out();
out("  --font-display: " + family(t.typography.heading.fontFamily) + ";");
out("  --font-text: " + family(t.typography["body-md"].fontFamily) + ";");
out("  --font-mono: " + family(t.typography.amount.fontFamily) + ";");
out();
for (const [name, value] of Object.entries(t.motion)) {
  if (name === "easing") out(`  --ease-skin: ${value};`);
  else out(`  --motion-${name}: ${value};`);
}
out("}");
out();

out("@layer base {");
out("  :root {");
out("    color-scheme: light dark;");
out("  }");
out("  @media (prefers-color-scheme: dark) {");
out("    :root {");
for (const [name, value] of Object.entries(t["colors-dark"])) out(`      --color-${name}: ${value};`);
out(`      --shadow-float: ${ref(t.elevation["float-dark"])};`);
if (t.elevation["bar-dark"]) out(`      --shadow-bar: ${ref(t.elevation["bar-dark"])};`);
out("    }");
out("  }");
out("}");
out();

for (const [name, role] of Object.entries(t.typography)) {
  const italic = role.fontStyle === "italic";
  const mono = /Mono/.test(role.fontFamily);
  out(`@utility type-${name} {`);
  out(`  font-family: ${family(role.fontFamily, italic)};`);
  out(`  font-size: ${px(role.fontSize)};`);
  out(`  font-weight: ${role.fontWeight};`);
  out(`  line-height: ${role.lineHeight};`);
  out(`  letter-spacing: ${px(role.letterSpacing)};`);
  if (italic) out("  font-style: italic;");
  if (role.textTransform) out(`  text-transform: ${role.textTransform};`);
  if (role.fontVariationSettings) out(`  font-variation-settings: ${role.fontVariationSettings};`);
  if (role.fontFeatureSettings) out(`  font-feature-settings: ${role.fontFeatureSettings};`);
  if (mono) out("  font-variant-numeric: tabular-nums;");
  // SKIN gives a few display roles a smaller mobile size (display-xl, bake-number,
  // timer-xl); nested here so every call site gets it for free, the same way the
  // desktop size already is, instead of each one repeating a max-tablet override.
  if (role.fontSizeMobile) {
    out("  @media (max-width: 767.98px) {");
    out(`    font-size: ${px(role.fontSizeMobile)};`);
    out("  }");
  }
  out("}");
  out();
}

const target = resolve(root, "styles/tokens.css");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, lines.join("\n"));
console.log(`Wrote ${target}`);
