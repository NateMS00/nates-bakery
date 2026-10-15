"use server";

import { dataBackend } from "@/lib/backend";
import type { BakeFields, SaveResult } from "@/lib/backend/types";
import { blockers, type EditorState } from "./editor";
import type { BakeLogEntry, Draft, ShareLink } from "./types";

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

/**
 * The Library (lib/data/store.ts): polled for each still-importing draft row, so it
 * becomes Ready to review or Couldn't finish without a reload (BONES-recipes.md).
 */
export async function getDraftStatus(draftId: string): Promise<{ status: Draft["status"]; title: string | null } | null> {
  const draft = await (await data()).getDraft(draftId);
  return draft ? { status: draft.status, title: draft.title } : null;
}

/**
 * Review Import: polled while Retry waits on the Shortcut, so the editor fills in with
 * the new recipe (or goes back to Couldn't finish) without a reload.
 */
export async function getDraftContent(draftId: string): Promise<{ status: Draft["status"]; content: EditorState | null } | null> {
  const draft = await (await data()).getDraft(draftId);
  return draft ? { status: draft.status, content: draft.content ?? null } : null;
}

/** Set up the Shortcut: when the owner's import key was made, or null if there isn't one. */
export async function getImportKeyCreatedAt(): Promise<string | null> {
  return (await data()).getImportKeyCreatedAt();
}

/** Create import key, or Revoke and create a new one: returned once, never stored client-side after. */
export async function createImportKey(): Promise<string> {
  return (await data()).createImportKey();
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

/**
 * "Handed to the Shortcut" (BONES-import): polled while the page waits for the
 * Shortcut to finish, so "Open the draft" can appear without a reload.
 */
export async function findReadyDraft(reelUrl: string): Promise<{ id: string } | null> {
  return (await data()).findReadyDraftByReelUrl(reelUrl);
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
