"use server";

import { cookies } from "next/headers";
import { blockers, newId, toRecipeContent, type EditorState } from "./editor";
import { normalizeReelUrl, type FailReason, type StartResult } from "./import";
import { db } from "./recipes";
import type { Recipe } from "./types";

// Server actions over the in-memory fixtures. The same checks run here as in the
// editor, so a draft with a Missing amount can't be saved by any route.

export type SaveResult = { ok: true; recipeId: string } | { ok: false; error: "blocked" | "failed" };

// STUB fault injection: with this cookie set, saves fail, so Save failed can be seen
// and tested before there's a real server to fail.
const FAIL_SAVES_COOKIE = "backery_stub_fail_saves";
async function failing() {
  return (await cookies()).get(FAIL_SAVES_COOKIE)?.value === "1";
}

function slug(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${base || "recipe"}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Review Import autosave: every edit is kept with the draft. */
export async function saveDraftContent(draftId: string, content: EditorState): Promise<boolean> {
  const draft = (await db()).drafts.find((d) => d.id === draftId);
  if (!draft) return false;
  draft.content = content;
  draft.title = content.title.trim() || null;
  return true;
}

/** Review Import: Save recipe → the draft becomes a recipe and leaves Drafts. */
export async function saveImport(draftId: string, content: EditorState): Promise<SaveResult> {
  if (blockers(content).length) return { ok: false, error: "blocked" };
  if (await failing()) return { ok: false, error: "failed" };
  const data = await db();
  const draft = data.drafts.find((d) => d.id === draftId);
  if (!draft) return { ok: false, error: "failed" };
  const recipe: Recipe = {
    ...toRecipeContent({ ...content, creatorHandle: content.creatorHandle ?? draft.creatorHandle }),
    id: slug(content.title),
    rating: null,
    favorite: false,
    bakeLog: [],
    shareLink: null,
    createdAt: new Date().toISOString(),
  };
  data.recipes.unshift(recipe);
  data.drafts = data.drafts.filter((d) => d.id !== draftId);
  return { ok: true, recipeId: recipe.id };
}

/** Discard confirmation: the draft and its extracted recipe are deleted. */
export async function discardDraft(draftId: string) {
  const data = await db();
  data.drafts = data.drafts.filter((d) => d.id !== draftId);
}

/** New Recipe: Save → /recipes/:recipeId. */
export async function createRecipe(content: EditorState): Promise<SaveResult> {
  if (blockers(content).length) return { ok: false, error: "blocked" };
  if (await failing()) return { ok: false, error: "failed" };
  const recipe: Recipe = {
    ...toRecipeContent(content),
    id: slug(content.title),
    rating: null,
    favorite: false,
    bakeLog: [],
    shareLink: null,
    createdAt: new Date().toISOString(),
  };
  (await db()).recipes.unshift(recipe);
  return { ok: true, recipeId: recipe.id };
}

/** Edit Recipe: Save keeps the recipe's rating, favorite, bake log, and share link. */
export async function updateRecipe(recipeId: string, content: EditorState): Promise<SaveResult> {
  if (blockers(content).length) return { ok: false, error: "blocked" };
  if (await failing()) return { ok: false, error: "failed" };
  const data = await db();
  const index = data.recipes.findIndex((r) => r.id === recipeId);
  if (index === -1) return { ok: false, error: "failed" };
  const current = data.recipes[index];
  data.recipes[index] = { ...current, ...toRecipeContent(content) };
  return { ok: true, recipeId };
}

/** Delete recipe confirmation (Edit only): also ends the recipe's share link. */
export async function deleteRecipe(recipeId: string) {
  const data = await db();
  data.recipes = data.recipes.filter((r) => r.id !== recipeId);
}

// ── Import (SKELETON FLOW-01). STUB: stands in for the import service. ──
// Reel ids starting with Cprivate, Cdeleted, or Cnorecipe fail with that reason; any
// other valid link becomes a draft that finishes importing on the server after
// IMPORT_MS (see completeImports in recipes.ts), even if the owner leaves the page.

const STUB_FAILURES: [RegExp, FailReason][] = [
  [/\/Cprivate/i, "private"],
  [/\/Cdeleted/i, "deleted"],
  [/\/Cnorecipe/i, "no-recipe"],
];

/** Import: validate the link, catch reels already saved, then start the import. */
export async function startImport(link: string, options: { again?: boolean } = {}): Promise<StartResult> {
  const url = normalizeReelUrl(link);
  if (!url) return { status: "invalid" };
  const data = await db();
  if (!options.again) {
    const saved = data.recipes.find((r) => r.source && normalizeReelUrl(r.source.reelUrl) === url);
    if (saved) return { status: "already", recipeId: saved.id, title: saved.title };
  }
  const failure = STUB_FAILURES.find(([re]) => re.test(url));
  if (failure) return { status: "failed", reason: failure[1] };
  const draftId = newId("d");
  data.drafts.unshift({
    id: draftId,
    status: "importing",
    title: null,
    creatorHandle: "kouign.kate",
    reelUrl: url,
    createdAt: new Date().toISOString(),
    startedAt: Date.now(),
  });
  return { status: "started", draftId };
}
