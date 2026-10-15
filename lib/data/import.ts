// Import helpers shared by the Import page and the import API routes (SKELETON
// FLOW-01, BONES-import.md). The import runs in the Nate's Bakery Shortcut: this page
// hands a reel link to it and the Shortcut calls the server back.

/** SKELETON FLOW-01: only Instagram reel or post links can be imported. */
const REEL_RE = /^(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/(reel|reels|p)\/([A-Za-z0-9_-]+)\/?(?:[?#].*)?$/i;

/** The canonical form used to match a link against saved recipes, or null if it isn't a reel or post. */
export function normalizeReelUrl(input: string): string | null {
  const m = input.trim().match(REEL_RE);
  if (!m) return null;
  const kind = m[1].toLowerCase() === "p" ? "p" : "reel";
  return `https://www.instagram.com/${kind}/${m[2]}/`;
}

// SKELETON 1.4.0: caption only, read by Apple Intelligence through the Shortcut. The
// Shortcut shows its own progress; this list is informational only, not animated.
export const IMPORT_STAGES = ["Getting the caption", "Reading the recipe", "Converting to grams"] as const;

/**
 * BONES-import "Handed to the Shortcut": the Shortcuts app's run-shortcut link
 * (docs/shortcut-guide.md). The name has a curly apostrophe (U+2019); copy it from
 * here rather than retyping it when building the real Shortcut.
 */
export const SHORTCUT_NAME = "Nate’s Bakery";

/**
 * "Import again" and "Retry" are the same hand-off, but need the Shortcut to skip
 * import_begin's "already imported" check (Retry) or let it create a new draft even
 * though one's already saved (Import again). The run-shortcut link can only carry one
 * text value, so `again` rides along as a URL fragment the Shortcut strips before
 * calling start-import (docs/shortcut-guide.md).
 */
export function runShortcutUrl(reelUrl: string, options: { again?: boolean } = {}): string {
  const text = options.again ? `${reelUrl}#again` : reelUrl;
  return `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(text)}`;
}

export type FailReason = "private" | "deleted" | "no-recipe" | "unavailable" | "limit";

export const FAIL_MESSAGES: Record<FailReason, string> = {
  private: "This reel is private, so Nate’s Bakery can’t read it.",
  deleted: "This reel has been deleted.",
  "no-recipe": "This reel’s caption doesn’t include the recipe.",
  // The live caption fetch can't yet tell a private reel from a deleted one from
  // Apify's response, so any fetch failure other than those stub cases lands here.
  unavailable: "Couldn’t reach this reel. The import service may be down — try again in a few minutes.",
  limit: "You’ve reached today’s import limit. Try again tomorrow, or enter this one by hand.",
};

/** Where the Shortcut is installed from. STUB: the Shortcut hasn't been published yet. */
export const SHORTCUT_URL = "https://www.icloud.com/shortcuts/backery-import";

/**
 * BONES-import "Setup needed": the Shortcut found no import key ("no-key"), or the
 * server rejected it as revoked or malformed ("bad-key"). Not a FailReason — this
 * opens Set up the Shortcut instead of the status area's error notice.
 */
export type SetupReason = "no-key" | "bad-key";

export const SETUP_MESSAGES: Record<SetupReason, string> = {
  "no-key": "Add your import key to the Shortcut to start importing.",
  "bad-key": "Your import key no longer works. Create a new one.",
};

/**
 * What the start-import route (app/api/import/start) answers the Shortcut, as JSON
 * (docs/shortcut-guide.md step 2). "ready" and "limit" aren't in the Shortcut's
 * original response list — see the guide's Build notes for why they were added.
 * Every status but "started" carries `open`: the full absolute URL the Shortcut
 * should open and then stop — built server-side, with proper encoding, so the
 * Shortcut never constructs a URL itself.
 */
export type StartImportResponse =
  | { status: "key-invalid"; open: string }
  | { status: "invalid"; open: string }
  | { status: "limit"; open: string }
  | { status: "already"; recipeId: string; title: string; open: string }
  | { status: "ready"; draftId: string; open: string }
  | { status: "started"; draftId: string; caption: string }
  | { status: "failed"; reason: FailReason; open: string };

/**
 * What the finish-import route (app/api/import/finish) answers the Shortcut, as JSON
 * (docs/shortcut-guide.md step 6). "no-recipe" is a Build notes addition: FLOW-01
 * deletes the draft and sends the owner to a different message than "Couldn't finish".
 * Every status but "retry" carries `open`, the same as StartImportResponse.
 */
export type FinishImportResponse =
  | { status: "retry" }
  | { status: "ready"; open: string }
  | { status: "failed"; open: string }
  | { status: "no-recipe"; open: string };

/**
 * What the Shortcut's redirect back to /import means (?error=…&url=…, or
 * ?already=…&recipeId=…&title=…): computed server-side from the URL, so ImportView
 * doesn't parse search params itself.
 */
export type LandingState = { kind: "failed"; reason: FailReason; url: string } | { kind: "already"; recipeId: string; title: string; url: string };
