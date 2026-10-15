import type { EditorState } from "@/lib/data/editor";
import type { StartResult } from "@/lib/data/import";
import type { BakeLogEntry, Draft, Recipe, SharedRecipe, ShareLink } from "@/lib/data/types";
import type { Session } from "@/lib/auth/rules";

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

  // Import (behind BACKERY_FEATURE_IMPORT): drafts and the import service.
  getDrafts(): Promise<Draft[]>;
  getDraft(id: string): Promise<Draft | null>;
  saveDraftContent(draftId: string, content: EditorState): Promise<boolean>;
  saveImport(draftId: string, content: EditorState): Promise<SaveResult>;
  discardDraft(draftId: string): Promise<void>;
  /** `url` is already normalized. */
  startImport(url: string, options: { again?: boolean }): Promise<StartResult>;
  /** Re-runs a "failed" draft's import from its kept caption. False if the draft isn't "failed". */
  retryDraft(draftId: string): Promise<boolean>;

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
