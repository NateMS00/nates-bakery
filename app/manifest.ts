import type { MetadataRoute } from "next";

// Web app manifest (Add to Home Screen; SKELETON FLOW-05 needs the Home Screen app for
// timer alerts). short_name is the Home Screen label, kept short so it isn't truncated.
// Colours: SKIN canvas. No icons yet (BACKLOG): the phone uses a page snapshot.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nate’s Bakery",
    short_name: "Nate’s",
    description: "Recipes from baking reels, in grams, with a log of every bake.",
    start_url: "/recipes",
    display: "standalone",
    background_color: "#F6F2E8",
    theme_color: "#F6F2E8",
  };
}
