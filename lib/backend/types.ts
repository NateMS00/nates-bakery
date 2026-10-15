import type { EditorState } from "@/lib/data/editor";
import type { BakeLogEntry, Draft, Recipe, SharedRecipe, ShareLink } from "@/lib/data/types";
import type { Session } from "@/lib/auth/rules";

/** import_begin's answer (supabase/migrations/0002_import.sql), mirrored for fixtures too. */
export type BeginImportResult =
  | { status: "bad-key" }
  | { status: "invalid" }
  | { status: "limit" }
  | { status: "already"; recipeId: string; title: string }
  | { status: "ready"; draftId: string }
  | { status: "caption"; draftId: string; caption: string; creatorHandle: string | null }
  | { status: "fetch"; draftId: string };

// The two halves the app talks to, so the pages and actions don't care where data
// lives: `fixtures` (in-memory, for development and Playwright) or `supabase`
// (production). Chosen by BACKERY_BACKEND; see ./index.ts.

export type SaveResult = { ok: true; recipeId: string } | { ok: false; error: "blocked" | "failed" };

export type BakeFields = Omit<BakeLogEntry, "id">;

export interface DataBackend {
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | null>;
  /** Only what /r/ shows, or null for an unknown or revoked token. */
  getSharedRecipe(token: string): Promise<SharedRecipe | null>;

  // The editor's content is already checked (no blockers) when these run.
  createRecipe(content: EditorState): Promise<SaveResult>;
  /** Keeps rating, favorite, bake log, and share link. */
  updateRecipe(id: string, content: EditorState): Promise<SaveResult>;
  /** Also ends the recipe's share link. */
  deleteRecipe(id: string): Promise<void>;

  setFavorite(recipeId: string, favorite: boolean): Promise<void>;
  setRating(recipeId: string, rating: number | null): Promise<void>;
  addBake(recipeId: string, fields: BakeFields): Promise<BakeLogEntry | null>;
  updateBake(recipeId: string, entryId: string, fields: BakeFields): Promise<boolean>;
  deleteBake(recipeId: string, entryId: string): Promise<void>;
  createShareLink(recipeId: string): Promise<ShareLink | null>;
  revokeShareLink(recipeId: string): Promise<void>;

  // Import (behind BACKERY_FEATURE_IMPORT): the owner's own session reads and edits
  // drafts; "Open the draft" polls for one. Getting a ready draft also copies its
  // thumbnail into Storage the first time (SKELETON 1.4.6), best-effort.
  getDrafts(): Promise<Draft[]>;
  getDraft(id: string): Promise<Draft | null>;
  /** The newest ready draft for this reel, or null — polled while "Handed to the Shortcut" shows. */
  findReadyDraftByReelUrl(reelUrl: string): Promise<{ id: string } | null>;
  saveDraftContent(draftId: string, content: EditorState): Promise<boolean>;
  saveImport(draftId: string, content: EditorState): Promise<SaveResult>;
  discardDraft(draftId: string): Promise<void>;

  // The import API routes (app/api/import/*, called by the Shortcut with its import
  // key, never a session): mirror supabase/migrations/0002_import.sql and 0003's
  // import_* functions 1:1, so lib/import/server.ts's orchestration is backend-agnostic.
  importBegin(key: string, url: string, again: boolean): Promise<BeginImportResult>;
  importSetCaption(key: string, draftId: string, caption: string, creatorHandle: string | null, thumbnailUrl: string | null): Promise<boolean>;
  /** What finish-import needs to build the recipe once a reply parses, or null if the draft isn't waiting on one. */
  importGetCaption(key: string, draftId: string): Promise<{ caption: string; creatorHandle: string | null; reelUrl: string } | null>;
  importFinish(key: string, draftId: string, title: string, language: string, content: EditorState): Promise<boolean>;
  importUnfinished(key: string, draftId: string): Promise<boolean>;
  importDrop(key: string, draftId: string): Promise<boolean>;
  /** True the first time a draft's reply fails to parse; false every time after. */
  importMarkRetry(key: string, draftId: string): Promise<boolean>;

  /** When the owner's import key was made, or null if there isn't one yet. Never the key itself. */
  getImportKeyCreatedAt(): Promise<string | null>;
  /** Creates the owner's import key, replacing any earlier one at once. Returned only this once. */
  createImportKey(): Promise<string>;
}

export interface AuthBackend {
  getSession(): Promise<Session | null>;
  /** "invalid" for a wrong email or password alike (no account enumeration). */
  signIn(email: string, password: string): Promise<"ok" | "invalid">;
  signOut(): Promise<void>;
  /**
   * Sends a reset link if the address has an account; says nothing either way.
   * `confirmUrl` is this site's /auth/confirm, where the link should come back to.
   */
  requestPasswordReset(email: string, confirmUrl: string): Promise<void>;
  /**
   * /auth/confirm: exchanges what the emailed link brought back (a PKCE `code`, or a
   * `token_hash` from a custom template) for a reset session. False when it's used,
   * expired, or opened in a different browser than the one that asked for it.
   */
  confirmEmailLink(link: { code: string | null; tokenHash: string | null; type: string | null }): Promise<boolean>;
  /** Whether the current reset link can still set a password (single use). */
  resetLinkIsValid(token: string | undefined): Promise<boolean>;
  /** Sets the new password and uses up the link; "expired" if it was already used. */
  completePasswordReset(token: string | undefined, password: string): Promise<"ok" | "expired">;
}
