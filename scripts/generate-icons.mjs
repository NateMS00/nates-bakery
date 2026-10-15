// Generates the app icon and favicon files from design-reference/icons/ (SKIN.md
// app-icon and favicon components). Run with `npm run icons` whenever the source
// artwork changes. Never edit the generated public/ files by hand.
//
// Source SVGs carry a C2PA provenance block (Content Credentials, added by the tool
// that exported them) — real metadata about the file's own history, but not part of
// the icon's appearance, and ~7KB per file. Stripped from every generated file,
// including the one SVG that ships as-is (favicon.svg).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");

/** Strips the <metadata> (C2PA) element and its now-unused xmlns:c2pa declaration. */
function stripMetadata(svg) {
  return svg.replace(/<metadata>[\s\S]*?<\/metadata>/, "").replace(/\s+xmlns:c2pa="[^"]*"/, "");
}

function readIcon(name) {
  return stripMetadata(readFileSync(resolve(root, "design-reference/icons", name), "utf8"));
}

/** A single-image PNG-in-ICO: the ICONDIR header, one ICONDIRENTRY, then the PNG bytes. */
function pngToIco(png, size) {
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6); // width (256 would need 0, not needed at 32px)
  header.writeUInt8(size, 7); // height
  header.writeUInt8(0, 8); // palette: none
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14); // PNG byte length
  header.writeUInt32LE(22, 18); // offset to the PNG data
  return Buffer.concat([header, png]);
}

// App icon: 1024 master, plus every size the manifest and <head> need. The source
// square already fills edge-to-edge in cobalt, but flatten guarantees a fully opaque
// PNG (no alpha channel) regardless — iOS composites its own corner mask and shadow.
const appIcon = readIcon("app-icon.svg");
for (const size of [1024, 512, 192, 180]) {
  const png = await sharp(Buffer.from(appIcon)).resize(size, size).flatten({ background: "#1D3F9E" }).png().toBuffer();
  const name = size === 1024 ? "icon-1024.png" : size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  writeFileSync(resolve(publicDir, name), png);
  console.log(`public/${name} (${size}×${size})`);
}

// Favicon: the soft-cut N (SKIN.md 2026-10-15: SOFT 0 was tried for the wordmark but
// its hairlines broke up at 24px/1x, so the wordmark — and favicon.svg, same cut —
// stayed on SOFT 100), shipped as-is and as a 32px .ico for browsers that don't read
// SVG favicons.
const favicon = readIcon("favicon-chunky.svg");
writeFileSync(resolve(publicDir, "favicon.svg"), favicon);
console.log("public/favicon.svg");

const faviconPng32 = await sharp(Buffer.from(favicon)).resize(32, 32).flatten({ background: "#1D3F9E" }).png().toBuffer();
writeFileSync(resolve(publicDir, "favicon.ico"), pngToIco(faviconPng32, 32));
console.log("public/favicon.ico (32×32)");
