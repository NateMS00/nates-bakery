import { toRecipeContent } from "@/lib/data/editor";
import type { BeginImportResult, DataBackend, SaveResult } from "../types";
import { DRAFT_SELECT, RECIPE_SELECT, bakeFromRow, draftFromRow, recipeFromRow, sharedFromRow, type BakeRow, type DraftRow, type RecipeRow, type SharedRow } from "./map";
import { supabasePublic } from "./public";
import { supabaseServer } from "./server";

const THUMBNAIL_BUCKET = "recipe-thumbnails";
const THUMBNAIL_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const THUMBNAIL_MAX_BYTES = 2_097_152; // the bucket's own file_size_limit (0002)

/**
 * SKELETON 1.4.6: the reel thumbnail copies into Storage the first time its draft is
 * opened, not at save — a draft can wait days, and Instagram's link expires first.
 * Runs in the owner's own session (no service-role key, no separate upload slot);
 * any failure here just leaves the picture placeholder (SKELETON: "nothing else breaks").
 */
async function copyThumbnail(db: Awaited<ReturnType<typeof supabaseServer>>, url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ext = THUMBNAIL_TYPES[res.headers.get("content-type") ?? ""];
    if (!ext) return null;
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength > THUMBNAIL_MAX_BYTES) return null;
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return null;
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from(THUMBNAIL_BUCKET).upload(path, bytes, { contentType: res.headers.get("content-type") ?? undefined });
    return error ? null : path;
  } catch {
    return null;
  }
}

/** picture carries a raw Storage path (map.ts) until this resolves it to a signed URL. */
async function resolvePicture(db: Awaited<ReturnType<typeof supabaseServer>>, recipe: ReturnType<typeof recipeFromRow>) {
  if (!recipe.picture) return recipe;
  const { data } = await db.storage.from(THUMBNAIL_BUCKET).createSignedUrl(recipe.picture, 3600);
  return { ...recipe, picture: data?.signedUrl ?? null };
}

// The Supabase backend: every query runs as the signed-in owner, and row-level
// security (supabase/migrations/0001_init.sql) limits it to their own rows. A failed
// read throws (the Error page); a failed save returns { ok: false, error: "failed" }.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fail(what: string, error: { message: string; code?: string }): never {
  throw new Error(`Supabase: ${what} failed (${error.code ?? "?"}): ${error.message}`);
}

export const supabaseData: DataBackend = {
  async getRecipes() {
    const db = await supabaseServer();
    const { data, error } = await db.from("recipes").select(RECIPE_SELECT).order("created_at", { ascending: false });
    if (error) fail("loading recipes", error);
    return Promise.all((data as unknown as RecipeRow[]).map(recipeFromRow).map((r) => resolvePicture(db, r)));
  },

  async getRecipe(id) {
    if (!UUID.test(id)) return null; // not one of ours: Not found
    const db = await supabaseServer();
    const { data, error } = await db.from("recipes").select(RECIPE_SELECT).eq("id", id).maybeSingle();
    if (error) fail("loading a recipe", error);
    return data ? resolvePicture(db, recipeFromRow(data as unknown as RecipeRow)) : null;
  },

  async getSharedRecipe(token) {
    const db = await supabaseServer();
    const { data, error } = await db.rpc("shared_recipe", { p_token: token });
    if (error) fail("loading a shared recipe", error);
    return data ? sharedFromRow(data as SharedRow) : null;
  },

  async createRecipe(content): Promise<SaveResult> {
    const db = await supabaseServer();
    const { data, error } = await db.rpc("save_recipe", { p_id: null, p_content: toRecipeContent(content) });
    if (error || !data) return { ok: false, error: "failed" };
    return { ok: true, recipeId: data as string };
  },

  async updateRecipe(id, content): Promise<SaveResult> {
    if (!UUID.test(id)) return { ok: false, error: "failed" };
    const db = await supabaseServer();
    const { data, error } = await db.rpc("save_recipe", { p_id: id, p_content: toRecipeContent(content) });
    if (error || !data) return { ok: false, error: "failed" };
    return { ok: true, recipeId: data as string };
  },

  async deleteRecipe(id) {
    if (!UUID.test(id)) return;
    const db = await supabaseServer();
    const { error } = await db.from("recipes").delete().eq("id", id);
    if (error) fail("deleting a recipe", error);
  },

  async setFavorite(recipeId, favorite) {
    const db = await supabaseServer();
    const { error } = await db.from("recipes").update({ favorite }).eq("id", recipeId);
    if (error) fail("saving the favorite", error);
  },

  async setRating(recipeId, rating) {
    const db = await supabaseServer();
    const { error } = await db.from("recipes").update({ rating }).eq("id", recipeId);
    if (error) fail("saving the rating", error);
  },

  async addBake(recipeId, fields) {
    const db = await supabaseServer();
    const { data, error } = await db
      .from("bakes")
      .insert({
        recipe_id: recipeId,
        baked_on: fields.date,
        scale: fields.scale,
        what_changed: fields.whatChanged?.trim() || null,
        how_it_turned_out: fields.howItTurnedOut?.trim() || null,
      })
      .select("id, baked_on, scale, what_changed, how_it_turned_out, created_at")
      .single();
    if (error) return null;
    return bakeFromRow(data as BakeRow);
  },

  async updateBake(recipeId, entryId, fields) {
    const db = await supabaseServer();
    const { data, error } = await db
      .from("bakes")
      .update({
        baked_on: fields.date,
        scale: fields.scale,
        what_changed: fields.whatChanged?.trim() || null,
        how_it_turned_out: fields.howItTurnedOut?.trim() || null,
      })
      .eq("id", entryId)
      .eq("recipe_id", recipeId)
      .select("id");
    return !error && (data?.length ?? 0) > 0;
  },

  async deleteBake(recipeId, entryId) {
    const db = await supabaseServer();
    const { error } = await db.from("bakes").delete().eq("id", entryId).eq("recipe_id", recipeId);
    if (error) fail("deleting a bake", error);
  },

  async createShareLink(recipeId) {
    const db = await supabaseServer();
    // One link per recipe: keep an existing one, otherwise the database makes a token.
    const { error } = await db.from("share_links").upsert({ recipe_id: recipeId }, { onConflict: "recipe_id", ignoreDuplicates: true });
    if (error) return null;
    const { data } = await db.from("share_links").select("token, created_at").eq("recipe_id", recipeId).maybeSingle();
    return data ? { token: data.token as string, createdAt: data.created_at as string } : null;
  },

  async revokeShareLink(recipeId) {
    const db = await supabaseServer();
    const { error } = await db.from("share_links").delete().eq("recipe_id", recipeId);
    if (error) fail("revoking the share link", error);
  },

  // Import (behind BACKERY_FEATURE_IMPORT): the owner's own session.
  async getDrafts() {
    const db = await supabaseServer();
    const { data, error } = await db.from("drafts").select(DRAFT_SELECT).order("created_at", { ascending: false });
    if (error) fail("loading drafts", error);
    return (data as unknown as DraftRow[]).map(draftFromRow);
  },

  async getDraft(id) {
    if (!UUID.test(id)) return null;
    const db = await supabaseServer();
    const { data, error } = await db.from("drafts").select(DRAFT_SELECT).eq("id", id).maybeSingle();
    if (error) fail("loading a draft", error);
    if (!data) return null;
    let draft = draftFromRow(data as unknown as DraftRow);
    // First open of a ready draft with an uncopied thumbnail (SKELETON 1.4.6).
    if (draft.status === "ready" && draft.thumbnailUrl && draft.content && !draft.content.thumbnailPath) {
      const path = await copyThumbnail(db, draft.thumbnailUrl);
      if (path) {
        const content = { ...draft.content, thumbnailPath: path };
        const { error: saveError } = await db.from("drafts").update({ content }).eq("id", id);
        if (!saveError) draft = { ...draft, content };
      }
    }
    return draft;
  },

  async findReadyDraftByReelUrl(reelUrl) {
    const db = await supabaseServer();
    const { data } = await db.from("drafts").select("id").eq("reel_url", reelUrl).eq("status", "ready").order("created_at", { ascending: false }).limit(1).maybeSingle();
    return data ? { id: data.id as string } : null;
  },

  async saveDraftContent(draftId, content) {
    if (!UUID.test(draftId)) return false;
    const db = await supabaseServer();
    const { error } = await db.from("drafts").update({ title: content.title.trim() || null, content }).eq("id", draftId);
    return !error;
  },

  async saveImport(draftId, content): Promise<SaveResult> {
    if (!UUID.test(draftId)) return { ok: false, error: "failed" };
    const db = await supabaseServer();
    const { data, error } = await db.rpc("save_recipe", { p_id: null, p_content: toRecipeContent(content) });
    if (error || !data) return { ok: false, error: "failed" };
    await db.from("drafts").delete().eq("id", draftId);
    return { ok: true, recipeId: data as string };
  },

  async discardDraft(draftId) {
    if (!UUID.test(draftId)) return;
    const db = await supabaseServer();
    const { error } = await db.from("drafts").delete().eq("id", draftId);
    if (error) fail("discarding the draft", error);
  },

  // The import API routes (app/api/import/*): called by the Shortcut with its import
  // key, no session — a plain anon-role client; the import_* functions
  // (supabase/migrations/0002_import.sql, 0003_retry.sql) authenticate the key.
  async importBegin(key, url, again) {
    const db = supabasePublic();
    const { data, error } = await db.rpc("import_begin", { p_key: key, p_url: url, p_again: again });
    if (error || !data) return { status: "bad-key" };
    return data as BeginImportResult;
  },

  async importSetCaption(key, draftId, caption, creatorHandle, thumbnailUrl) {
    const db = supabasePublic();
    const { data, error } = await db.rpc("import_set_caption", { p_key: key, p_draft: draftId, p_caption: caption, p_creator_handle: creatorHandle, p_thumbnail_url: thumbnailUrl });
    return !error && data === true;
  },

  async importGetCaption(key, draftId) {
    const db = supabasePublic();
    const { data, error } = await db.rpc("import_retry", { p_key: key, p_draft: draftId });
    if (error || !data) return null;
    const r = data as { status: string; caption?: string; creatorHandle?: string | null; reelUrl?: string };
    if (r.status !== "caption" || !r.caption || !r.reelUrl) return null;
    return { caption: r.caption, creatorHandle: r.creatorHandle ?? null, reelUrl: r.reelUrl };
  },

  async importFinish(key, draftId, title, language, content) {
    const db = supabasePublic();
    const { data, error } = await db.rpc("import_finish", { p_key: key, p_draft: draftId, p_title: title, p_language: language, p_content: content });
    return !error && data === true;
  },

  async importUnfinished(key, draftId) {
    const db = supabasePublic();
    const { data, error } = await db.rpc("import_unfinished", { p_key: key, p_draft: draftId });
    return !error && data === true;
  },

  async importDrop(key, draftId) {
    const db = supabasePublic();
    const { data, error } = await db.rpc("import_drop", { p_key: key, p_draft: draftId });
    return !error && data === true;
  },

  async importMarkRetry(key, draftId) {
    const db = supabasePublic();
    const { data, error } = await db.rpc("import_mark_retry", { p_key: key, p_draft: draftId });
    return !error && data === true;
  },

  // The import key itself doesn't need the rest of Import to be live (migration
  // 0002's schema and create_import_key() work regardless), so this one is real.
  async getImportKeyCreatedAt() {
    const db = await supabaseServer();
    const { data, error } = await db.from("import_keys").select("created_at").maybeSingle();
    if (error) fail("loading the import key", error);
    return (data?.created_at as string | undefined) ?? null;
  },

  async createImportKey() {
    const db = await supabaseServer();
    const { data, error } = await db.rpc("create_import_key");
    if (error || !data) fail("creating the import key", error ?? { message: "no key returned" });
    return data as string;
  },
};
