// Feature flags, read on the server (non-NEXT_PUBLIC_, so never baked into the client).

/**
 * Import from a reel (SKELETON FLOW-01) and its drafts. Off unless
 * BACKERY_FEATURE_IMPORT=on: production starts without the import service, with
 * manual entry (/recipes/new) as the way to add recipes. Development and the
 * Playwright servers turn it on.
 */
export function importEnabled(): boolean {
  return process.env.BACKERY_FEATURE_IMPORT === "on";
}
