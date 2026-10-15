import { cookies } from "next/headers";
import { OWNER_NAME } from "@/lib/auth/rules";
import { sortLog } from "@/lib/data/bakeLog";
import { newId, toRecipeContent, type EditorState } from "@/lib/data/editor";
import { normalizeReelUrl, type FailReason, type StartResult } from "@/lib/data/import";
import type { BakeLogEntry, Recipe, ShareLink } from "@/lib/data/types";
import type { BakeFields, DataBackend, SaveResult } from "../types";
import { db, simulatedLatency } from "./store";

// The fixtures backend: the in-memory store (./store.ts), with the stubs that let
// failure states be seen before there's a real server to fail.

// STUB fault injection: with this cookie set, saves fail (Save failed states).
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

function newRecipe(content: EditorState, creatorHandle?: string): Recipe {
  return {
    ...toRecipeContent({ ...content, creatorHandle: content.creatorHandle ?? creatorHandle }),
    id: slug(content.title),
    // No real thumbnail-copy pipeline yet (SKELETON 1.4.2 is stubbed until live import).
    picture: null,
    rating: null,
    favorite: false,
    bakeLog: [],
    shareLink: null,
    createdAt: new Date().toISOString(),
  };
}

async function findRecipe(recipeId: string) {
  return (await db()).recipes.find((r) => r.id === recipeId) ?? null;
}

function clean(f: BakeFields): BakeFields {
  return {
    date: f.date,
    scale: f.scale,
    whatChanged: f.whatChanged?.trim() || undefined,
    howItTurnedOut: f.howItTurnedOut?.trim() || undefined,
  };
}

// STUB import service: reel ids starting with Cprivate, Cdeleted, or Cnorecipe fail
// with that reason; any other link becomes a draft that finishes importing on the
// server after IMPORT_MS (see completeImports in ./store.ts).
const STUB_FAILURES: [RegExp, FailReason][] = [
  [/\/Cprivate/i, "private"],
  [/\/Cdeleted/i, "deleted"],
  [/\/Cnorecipe/i, "no-recipe"],
];

export const fixturesData: DataBackend = {
  async getRecipes() {
    await simulatedLatency();
    return (await db()).recipes;
  },

  async getRecipe(id) {
    await simulatedLatency();
    return (await db()).recipes.find((r) => r.id === id) ?? null;
  },

  async getSharedRecipe(token) {
    await simulatedLatency();
    const recipe = (await db()).recipes.find((r) => r.shareLink?.token === token);
    if (!recipe) return null;
    const { title, category, yield: makes, totalTimeMinutes, source, ingredientGroups, stepGroups, steps, rating } = recipe;
    // As shared_recipe: no notes and no "was 1 cup" (Converted reads as confirmed).
    const ingredients = recipe.ingredients.map(({ id, groupId, name, grams, status }) => ({ id, groupId, name, grams, status: status === "converted" ? ("confirmed" as const) : status }));
    return { title, category, yield: makes, totalTimeMinutes, source, ingredientGroups, stepGroups, ingredients, steps, rating, sharedBy: OWNER_NAME };
  },

  async createRecipe(content): Promise<SaveResult> {
    if (await failing()) return { ok: false, error: "failed" };
    const recipe = newRecipe(content);
    (await db()).recipes.unshift(recipe);
    return { ok: true, recipeId: recipe.id };
  },

  async updateRecipe(id, content): Promise<SaveResult> {
    if (await failing()) return { ok: false, error: "failed" };
    const data = await db();
    const index = data.recipes.findIndex((r) => r.id === id);
    if (index === -1) return { ok: false, error: "failed" };
    data.recipes[index] = { ...data.recipes[index], ...toRecipeContent(content) };
    return { ok: true, recipeId: id };
  },

  async deleteRecipe(id) {
    const data = await db();
    data.recipes = data.recipes.filter((r) => r.id !== id);
  },

  async setFavorite(recipeId, favorite) {
    const r = await findRecipe(recipeId);
    if (r) r.favorite = favorite;
  },

  async setRating(recipeId, rating) {
    const r = await findRecipe(recipeId);
    if (r) r.rating = rating;
  },

  async addBake(recipeId, fields) {
    const r = await findRecipe(recipeId);
    if (!r) return null;
    const entry: BakeLogEntry = { id: newId("bake"), ...clean(fields) };
    r.bakeLog = sortLog([entry, ...r.bakeLog]);
    return entry;
  },

  async updateBake(recipeId, entryId, fields) {
    const r = await findRecipe(recipeId);
    if (!r || !r.bakeLog.some((e) => e.id === entryId)) return false;
    r.bakeLog = sortLog(r.bakeLog.map((e) => (e.id === entryId ? { id: e.id, ...clean(fields) } : e)));
    return true;
  },

  async deleteBake(recipeId, entryId) {
    const r = await findRecipe(recipeId);
    if (r) r.bakeLog = r.bakeLog.filter((e) => e.id !== entryId);
  },

  async createShareLink(recipeId): Promise<ShareLink | null> {
    const r = await findRecipe(recipeId);
    if (!r) return null;
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    const token = Array.from({ length: 12 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    r.shareLink = { token, createdAt: new Date().toISOString() };
    return r.shareLink;
  },

  async revokeShareLink(recipeId) {
    const r = await findRecipe(recipeId);
    if (r) r.shareLink = null;
  },

  async getDrafts() {
    await simulatedLatency();
    return (await db()).drafts;
  },

  async getDraft(id) {
    await simulatedLatency();
    return (await db()).drafts.find((d) => d.id === id) ?? null;
  },

  async saveDraftContent(draftId, content) {
    const draft = (await db()).drafts.find((d) => d.id === draftId);
    if (!draft) return false;
    draft.content = content;
    draft.title = content.title.trim() || null;
    return true;
  },

  async saveImport(draftId, content): Promise<SaveResult> {
    if (await failing()) return { ok: false, error: "failed" };
    const data = await db();
    const draft = data.drafts.find((d) => d.id === draftId);
    if (!draft) return { ok: false, error: "failed" };
    const recipe = newRecipe(content, draft.creatorHandle);
    data.recipes.unshift(recipe);
    data.drafts = data.drafts.filter((d) => d.id !== draftId);
    return { ok: true, recipeId: recipe.id };
  },

  async discardDraft(draftId) {
    const data = await db();
    data.drafts = data.drafts.filter((d) => d.id !== draftId);
  },

  async startImport(url, options): Promise<StartResult> {
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
  },

  async retryDraft(draftId) {
    const draft = (await db()).drafts.find((d) => d.id === draftId);
    if (!draft || draft.status !== "failed") return false;
    draft.status = "importing";
    draft.startedAt = Date.now();
    return true;
  },

  async getImportKeyCreatedAt() {
    return (await db()).importKey?.createdAt ?? null;
  },

  async createImportKey() {
    const data = await db();
    const createdAt = new Date().toISOString();
    data.importKey = { createdAt };
    // STUB: a real-shaped key (nbk_ + 43 base64url characters), not real crypto.
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const key = Array.from({ length: 43 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    return `nbk_${key}`;
  },
};
