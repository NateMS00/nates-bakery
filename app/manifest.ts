import type { MetadataRoute } from "next";

// Web app manifest (Add to Home Screen; SKELETON FLOW-05 needs the Home Screen app for
// timer alerts). short_name is the Home Screen label, kept short so it isn't truncated.
// Colours: SKIN canvas (light — the manifest has no dark variant; app/layout.tsx's
// viewport.themeColor covers the live browser-chrome colour in both themes).
// Icons: public/icon-{192,512}.png (npm run icons, from SKIN's app-icon component).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nate’s Bakery",
    short_name: "Nate’s",
    description: "Recipes from baking reels, in grams, with a log of every bake.",
    start_url: "/recipes",
    display: "standalone",
    background_color: "#F6F2E8",
    theme_color: "#F6F2E8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
