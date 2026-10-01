// Import helpers shared by the Import page and the stubbed import service.

/** SKELETON FLOW-01: only Instagram reel or post links can be imported. */
const REEL_RE = /^(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/(reel|reels|p)\/([A-Za-z0-9_-]+)\/?(?:[?#].*)?$/i;

/** The canonical form used to match a link against saved recipes, or null if it isn't a reel or post. */
export function normalizeReelUrl(input: string): string | null {
  const m = input.trim().match(REEL_RE);
  if (!m) return null;
  const kind = m[1].toLowerCase() === "p" ? "p" : "reel";
  return `https://www.instagram.com/${kind}/${m[2]}/`;
}

export const IMPORT_STAGES = ["Reading the caption", "Listening to the audio", "Converting to grams"] as const;
/** How long each stage of the stubbed import takes. */
export const STAGE_MS = 1500;
export const IMPORT_MS = STAGE_MS * IMPORT_STAGES.length;

export type FailReason = "private" | "deleted" | "no-recipe";

export const FAIL_MESSAGES: Record<FailReason, string> = {
  private: "This reel is private, so Nate’s Bakery can’t read it.",
  deleted: "This reel has been deleted.",
  "no-recipe": "Nate’s Bakery couldn’t find a recipe in this reel.",
};

export type StartResult =
  | { status: "invalid" }
  | { status: "already"; recipeId: string; title: string }
  | { status: "failed"; reason: FailReason }
  | { status: "started"; draftId: string };

/** Where the Shortcut is installed from. STUB: the Shortcut hasn't been published yet. */
export const SHORTCUT_URL = "https://www.icloud.com/shortcuts/backery-import";
