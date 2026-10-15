"use server";

import { dataBackend } from "@/lib/backend";
import type { BakeFields, SaveResult } from "@/lib/backend/types";
import { blockers, type EditorState } from "./editor";
import { normalizeReelUrl, type StartResult } from "./import";
import type { BakeLogEntry, ShareLink } from "./types";

// Server actions. The editor's checks run here too, so a recipe with a Missing amount
// can't be saved by any route; the backend (lib/backend) does the reading and writing.

export type { BakeFields, SaveResult };

const data = dataBackend;

/** Review Import autosave: every edit is kept with the draft. */
export async function saveDraftContent(draftId: string, content: EditorState): Promise<boolean> {
  return (await data()).saveDraftContent(draftId, content);
}

/** Review Import: Save recipe → the draft becomes a recipe and leaves Drafts. */
export async function saveImport(draftId: string, content: EditorState): Promise<SaveResult> {
  if (blockers(content).length) return { ok: false, error: "blocked" };
  return (await data()).saveImport(draftId, content);
}

/** Discard confirmation: the draft and its extracted recipe are deleted. */
export async function discardDraft(draftId: string) {
  await (await data()).discardDraft(draftId);
}

/** Couldn't finish: Retry runs the Shortcut again for this draft, from its kept caption. */
export async function retryImport(draftId: string): Promise<boolean> {
  return (await data()).retryDraft(draftId);
}

/** New Recipe: Save → /recipes/:recipeId. */
export async function createRecipe(content: EditorState): Promise<SaveResult> {
  if (blockers(content).length) return { ok: false, error: "blocked" };
  return (await data()).createRecipe(content);
}

/** Edit Recipe: Save keeps the recipe's rating, favorite, bake log, and share link. */
export async function updateRecipe(recipeId: string, content: EditorState): Promise<SaveResult> {
  if (blockers(content).length) return { ok: false, error: "blocked" };
  return (await data()).updateRecipe(recipeId, content);
}

/** Delete recipe confirmation (Edit only): also ends the recipe's share link. */
export async function deleteRecipe(recipeId: string) {
  await (await data()).deleteRecipe(recipeId);
}

/** Import (SKELETON FLOW-01): validate the link, catch reels already saved, then start. */
export async function startImport(link: string, options: { again?: boolean } = {}): Promise<StartResult> {
  const url = normalizeReelUrl(link);
  if (!url) return { status: "invalid" };
  return (await data()).startImport(url, options);
}

// ── Recipe page and Bake Log (owner actions) ──

export async function setFavorite(recipeId: string, favorite: boolean) {
  await (await data()).setFavorite(recipeId, favorite);
}

export async function setRating(recipeId: string, rating: number | null) {
  await (await data()).setRating(recipeId, rating);
}

export async function addBake(recipeId: string, fields: BakeFields): Promise<BakeLogEntry | null> {
  return (await data()).addBake(recipeId, fields);
}

export async function updateBake(recipeId: string, entryId: string, fields: BakeFields): Promise<boolean> {
  return (await data()).updateBake(recipeId, entryId, fields);
}

/** Deleting the last entry makes the recipe Not baked yet again (SKELETON). */
export async function deleteBake(recipeId: string, entryId: string) {
  await (await data()).deleteBake(recipeId, entryId);
}

export async function createShareLink(recipeId: string): Promise<ShareLink | null> {
  return (await data()).createShareLink(recipeId);
}

export async function revokeShareLink(recipeId: string) {
  await (await data()).revokeShareLink(recipeId);
}
