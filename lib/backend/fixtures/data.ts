import { cookies } from "next/headers";
import { OWNER_NAME } from "@/lib/auth/rules";
import { deriveRecipeRating, sortLog } from "@/lib/data/bakeLog";
import { newId, toRecipeContent, type EditorState } from "@/lib/data/editor";
import { normalizeReelUrl, type FailReason } from "@/lib/data/import";
import type { BakeLogEntry, Draft, Recipe, ShareLink } from "@/lib/data/types";
import { ImportFetchFailure, type CaptionFetcher } from "@/lib/import/server";
import type { BakeFields, DataBackend, SaveResult } from "../types";
import { db, simulatedLatency } from "./store";

// The fixtures backend: the in-memory store (./store.ts), with the stubs that let
// failure states be seen before there's a real server to fail.

// STUB fault injection: with this cookie set, saves fail (Save failed states).
const FAIL_SAVES_COOKIE = "backery_stub_fail_saves";
async function failing() {
  return (await cookies()).get(FAIL_SAVES_COOKIE)?.value === "1";
}

// BONES-recipes.md 1.4.0: a draft stuck "importing" for more than 10 minutes (the
// Shortcut never finished) turns into "failed" ("Couldn't finish"), mirroring the
// Supabase backend's expire_stale_drafts (supabase/migrations/0004_stale_drafts.sql).
const STALE_IMPORT_MS = 10 * 60 * 1000;
export function expireStaleImports(drafts: Draft[]) {
  const now = Date.now();
  for (const d of drafts) {
    if (d.status === "importing" && now - (d.startedAt ?? Date.parse(d.createdAt)) > STALE_IMPORT_MS) d.status = "failed";
  }
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
    coverBakeId: null,
    cover: null,
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

/** `photo` (the resolved display value) never comes from the caller; it's recomputed below. */
function clean(f: BakeFields): Omit<BakeLogEntry, "id" | "photo"> {
  return {
    date: f.date,
    scale: f.scale,
    rating: f.rating,
    whatChanged: f.whatChanged?.trim() || undefined,
    howItTurnedOut: f.howItTurnedOut?.trim() || undefined,
    photoPath: f.photoPath,
  };
}

/** Fixtures have no Storage to sign from: a photoPath is already a usable static path. */
function withPhoto(entry: Omit<BakeLogEntry, "photo">): BakeLogEntry {
  return { ...entry, photo: entry.photoPath };
}

/** Mirrors recipe_rating() (supabase/migrations/0005_bake_photos_ratings.sql) and the
 * recipe's cover (its chosen bake's photo, else the reel thumbnail) on every read. */
function withDisplay(r: Recipe): Recipe {
  const coverBake = r.coverBakeId ? r.bakeLog.find((e) => e.id === r.coverBakeId) : undefined;
  return { ...r, rating: deriveRecipeRating(r), cover: coverBake?.photoPath ?? r.cover };
}

// STUB import service: reel ids starting with Cprivate, Cdeleted, or Cnorecipe fail
// with that reason; any other link becomes a draft (status "importing") that a real
// POST to /api/import/start and /api/import/finish — the same calls a real Shortcut
// makes — drives to "ready", mirroring the Supabase backend exactly.
const STUB_FAILURES: [RegExp, FailReason][] = [
  [/\/Cprivate/i, "private"],
  [/\/Cdeleted/i, "deleted"],
  [/\/Cnorecipe/i, "no-recipe"],
];

/** A canned caption, standing in for Apify in fixtures mode (lib/import/server.ts never calls the real fetchReel here). */
export const FIXTURE_CAPTION = "Kouign-amann, the butteriest pastry in Brittany. Laminated dough, lots of sugar, caramelised edges.";

/** Stands in for lib/import/apify.ts's fetchReel: reuses STUB_FAILURES, never calls Apify. */
export const fixturesFetchCaption: CaptionFetcher = async (url) => {
  const failure = STUB_FAILURES.find(([re]) => re.test(url));
  if (failure) throw new ImportFetchFailure(failure[1]);
  return { caption: FIXTURE_CAPTION, creatorHandle: "kouign.kate", thumbnailUrl: null };
};

export const fixturesData: DataBackend = {
  async getRecipes() {
    await simulatedLatency();
    return (await db()).recipes.map(withDisplay);
  },

  async getRecipe(id) {
    await simulatedLatency();
    const r = (await db()).recipes.find((r) => r.id === id) ?? null;
    return r ? withDisplay(r) : null;
  },

  async getSharedRecipe(token) {
    await simulatedLatency();
    const recipe = (await db()).recipes.find((r) => r.shareLink?.token === token);
    if (!recipe) return null;
    const { title, category, yield: makes, totalTimeMinutes, source, ingredientGroups, stepGroups, steps } = recipe;
    // As shared_recipe: no notes and no "was 1 cup" (Converted reads as confirmed);
    // never the cover or any bake photo (SKELETON 1.5.0). The rating is the same
    // derived value shown everywhere else, not the raw column (deriveRecipeRating
    // mirrors supabase's recipe_rating()).
    const ingredients = recipe.ingredients.map(({ id, groupId, name, grams, status }) => ({ id, groupId, name, grams, status: status === "converted" ? ("confirmed" as const) : status }));
    return { title, category, yield: makes, totalTimeMinutes, source, ingredientGroups, stepGroups, ingredients, steps, rating: deriveRecipeRating(recipe), sharedBy: OWNER_NAME };
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
    const entry = withPhoto({ id: newId("bake"), ...clean(fields) });
    r.bakeLog = sortLog([entry, ...r.bakeLog]);
    // "Use as cover" (SKELETON 1.5.0): only ever points at a bake with a photo.
    if (fields.useAsCover && fields.photoPath) r.coverBakeId = entry.id;
    return entry;
  },

  async updateBake(recipeId, entryId, fields) {
    const r = await findRecipe(recipeId);
    const existing = r?.bakeLog.find((e) => e.id === entryId);
    if (!r || !existing) return false;
    r.bakeLog = sortLog(r.bakeLog.map((e) => (e.id === entryId ? withPhoto({ id: e.id, ...clean(fields) }) : e)));
    // Replacing or removing this entry's photo clears the cover if this entry was
    // the one pointing to it, unless the same save also asks to keep it as cover.
    const photoChanged = existing.photoPath !== fields.photoPath;
    if (fields.useAsCover && fields.photoPath) r.coverBakeId = entryId;
    else if (photoChanged && r.coverBakeId === entryId) r.coverBakeId = null;
    return true;
  },

  async deleteBake(recipeId, entryId) {
    const r = await findRecipe(recipeId);
    if (!r) return;
    r.bakeLog = r.bakeLog.filter((e) => e.id !== entryId);
    if (r.coverBakeId === entryId) r.coverBakeId = null;
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
    const data = await db();
    expireStaleImports(data.drafts);
    return data.drafts;
  },

  async getDraft(id) {
    await simulatedLatency();
    const data = await db();
    expireStaleImports(data.drafts);
    return data.drafts.find((d) => d.id === id) ?? null;
  },

  async findReadyDraftByReelUrl(reelUrl) {
    const draft = (await db()).drafts.find((d) => d.status === "ready" && normalizeReelUrl(d.reelUrl) === reelUrl);
    return draft ? { id: draft.id } : null;
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

  // The import API routes (app/api/import/*, called by the Shortcut's import key):
  // mirror supabase/migrations/0002_import.sql and 0003_retry.sql's functions.
  async importBegin(key, url, again) {
    const data = await db();
    if (!data.importKey || data.importKey.key !== key) return { status: "bad-key" };
    const normalized = normalizeReelUrl(url);
    if (!normalized) return { status: "invalid" };
    if (!again) {
      const saved = data.recipes.find((r) => r.source && normalizeReelUrl(r.source.reelUrl) === normalized);
      if (saved) return { status: "already", recipeId: saved.id, title: saved.title };
    }
    const existing = data.drafts.find((d) => normalizeReelUrl(d.reelUrl) === normalized);
    if (existing?.status === "ready") return { status: "ready", draftId: existing.id };
    if (existing && existing.caption) {
      existing.status = "importing"; // "failed" (Couldn't finish) goes back to Importing, same as the Shortcut re-reading it
      existing.startedAt = Date.now(); // resets the stale-import clock (expireStaleImports)
      return { status: "caption", draftId: existing.id, caption: existing.caption, creatorHandle: existing.creatorHandle };
    }
    const draftId = existing?.id ?? newId("d");
    if (!existing) {
      data.drafts.unshift({ id: draftId, status: "importing", title: null, creatorHandle: "kouign.kate", reelUrl: normalized, createdAt: new Date().toISOString() });
    }
    return { status: "fetch", draftId };
  },

  async importSetCaption(key, draftId, caption, creatorHandle, thumbnailUrl) {
    const data = await db();
    if (!data.importKey || data.importKey.key !== key) return false;
    const draft = data.drafts.find((d) => d.id === draftId && d.status === "importing" && !d.caption);
    if (!draft) return false;
    draft.caption = caption;
    draft.creatorHandle = creatorHandle ?? draft.creatorHandle;
    draft.thumbnailUrl = thumbnailUrl ?? undefined;
    draft.startedAt = Date.now();
    return true;
  },

  async importGetCaption(key, draftId) {
    const data = await db();
    if (!data.importKey || data.importKey.key !== key) return null;
    const draft = data.drafts.find((d) => d.id === draftId && (d.status === "importing" || d.status === "failed") && d.caption);
    return draft ? { caption: draft.caption!, creatorHandle: draft.creatorHandle, reelUrl: draft.reelUrl } : null;
  },

  async importFinish(key, draftId, title, _language, content) {
    const data = await db();
    if (!data.importKey || data.importKey.key !== key) return false;
    const draft = data.drafts.find((d) => d.id === draftId && (d.status === "importing" || d.status === "failed"));
    if (!draft) return false;
    draft.status = "ready";
    draft.title = title || null;
    draft.content = content;
    return true;
  },

  async importUnfinished(key, draftId) {
    const data = await db();
    if (!data.importKey || data.importKey.key !== key) return false;
    const draft = data.drafts.find((d) => d.id === draftId && d.status === "importing");
    if (!draft) return false;
    draft.status = "failed";
    return true;
  },

  async importDrop(key, draftId) {
    const data = await db();
    if (!data.importKey || data.importKey.key !== key) return false;
    const before = data.drafts.length;
    data.drafts = data.drafts.filter((d) => !(d.id === draftId && d.status !== "ready"));
    return data.drafts.length < before;
  },

  async importMarkRetry(key, draftId) {
    const data = await db();
    if (!data.importKey || data.importKey.key !== key) return false;
    const draft = data.drafts.find((d) => d.id === draftId && d.status === "importing" && !d.retried);
    if (!draft) return false;
    draft.retried = true;
    return true;
  },

  async getImportKeyCreatedAt() {
    return (await db()).importKey?.createdAt ?? null;
  },

  async createImportKey() {
    const data = await db();
    const createdAt = new Date().toISOString();
    // STUB: a real-shaped key (nbk_ + 43 base64url characters), not real crypto.
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const key = `nbk_${Array.from({ length: 43 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")}`;
    data.importKey = { createdAt, key };
    return key;
  },
};
