import { toRecipeContent } from "@/lib/data/editor";
import type { BeginImportResult, DataBackend, SaveResult } from "../types";
import { DRAFT_SELECT, RECIPE_SELECT, bakeFromRow, draftFromRow, recipeFromRow, sharedFromRow, type BakeRow, type DraftRow, type RecipeRow, type SharedRow } from "./map";
import { supabasePublic } from "./public";
import { supabaseServer } from "./server";

const THUMBNAIL_BUCKET = "recipe-thumbnails";
const THUMBNAIL_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const THUMBNAIL_MAX_BYTES = 2_097_152; // the bucket's own file_size_limit (0002)

const BAKE_PHOTO_BUCKET = "bake-photos"; // 0005_bake_photos_ratings.sql: jpeg-only, 5 MB

/**
 * SKELETON 1.4.6: the reel thumbnail copies into Storage the first time its draft is
 * opened, not at save — a draft can wait days, and Instagram's link expires first.
 * Runs in the owner's own session (no service-role key, no separate upload slot);
 * any failure here just leaves the picture placeholder (SKELETON: "nothing else breaks").
 */
async function copyThumbnail(db: Awaited<ReturnType<typeof supabaseServer>>, url: string): Promise<string | null> {
  // Each branch logs why, not just that it failed — this ran silently until a real
  // first-open thumbnail copy needed diagnosing and nothing in Vercel's logs said why.
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`copyThumbnail: fetch failed with ${res.status}`);
      return null;
    }
    const contentType = res.headers.get("content-type") ?? "";
    const ext = THUMBNAIL_TYPES[contentType];
    if (!ext) {
      console.error(`copyThumbnail: unexpected content-type "${contentType}"`);
      return null;
    }
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength > THUMBNAIL_MAX_BYTES) {
      console.error(`copyThumbnail: ${bytes.byteLength} bytes over the ${THUMBNAIL_MAX_BYTES} limit`);
      return null;
    }
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) {
      console.error("copyThumbnail: no signed-in user on this session");
      return null;
    }
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from(THUMBNAIL_BUCKET).upload(path, bytes, { contentType: contentType || undefined });
    if (error) console.error(`copyThumbnail: upload failed: ${error.message}`);
    return error ? null : path;
  } catch (err) {
    console.error(`copyThumbnail: ${err instanceof Error ? err.message : "unknown error"}`);
    return null;
  }
}

/** A Storage path (map.ts carries it raw) resolved to a one-hour signed URL. */
async function signThumbnail(db: Awaited<ReturnType<typeof supabaseServer>>, path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { data } = await db.storage.from(THUMBNAIL_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/** A bake-photos Storage path resolved to a one-hour signed URL. */
async function signBakePhoto(db: Awaited<ReturnType<typeof supabaseServer>>, path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { data } = await db.storage.from(BAKE_PHOTO_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/**
 * Resolves every photo a recipe's response needs: each bake's own photo, and the
 * recipe's cover — the chosen bake's photo (`row.cover_bake_id`), else the reel
 * thumbnail (SKELETON 1.5.0). Needs the raw `row`, not just the mapped `recipe`,
 * because the cover's bucket (bake-photos vs. recipe-thumbnails) depends on which
 * one it came from.
 */
async function resolveRecipe(db: Awaited<ReturnType<typeof supabaseServer>>, row: RecipeRow, recipe: ReturnType<typeof recipeFromRow>): Promise<ReturnType<typeof recipeFromRow>> {
  const bakeLog = await Promise.all(recipe.bakeLog.map(async (e) => ({ ...e, photo: await signBakePhoto(db, e.photoPath) })));
  const coverBake = row.cover_bake_id ? row.bakes.find((b) => b.id === row.cover_bake_id) : undefined;
  const cover = coverBake?.photo_path ? await signBakePhoto(db, coverBake.photo_path) : await signThumbnail(db, row.source_thumbnail_path);
  return { ...recipe, bakeLog, cover };
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
    const rows = data as unknown as RecipeRow[];
    return Promise.all(rows.map((row) => resolveRecipe(db, row, recipeFromRow(row))));
  },

  async getRecipe(id) {
    if (!UUID.test(id)) return null; // not one of ours: Not found
    const db = await supabaseServer();
    const { data, error } = await db.from("recipes").select(RECIPE_SELECT).eq("id", id).maybeSingle();
    if (error) fail("loading a recipe", error);
    if (!data) return null;
    const row = data as unknown as RecipeRow;
    return resolveRecipe(db, row, recipeFromRow(row));
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
    // The cascade (0001_init.sql) removes the bake rows, but never touches their
    // Storage files — read their photo paths before they go with the rows.
    const { data } = await db.from("bakes").select("photo_path").eq("recipe_id", id);
    const { error } = await db.from("recipes").delete().eq("id", id);
    if (error) fail("deleting a recipe", error);
    const paths = ((data ?? []) as { photo_path: string | null }[]).map((b) => b.photo_path).filter((p): p is string => Boolean(p));
    if (paths.length) await db.storage.from(BAKE_PHOTO_BUCKET).remove(paths);
  },

  async setFavorite(recipeId, favorite) {
    const db = await supabaseServer();
    const { error } = await db.from("recipes").update({ favorite }).eq("id", recipeId);
    if (error) fail("saving the favorite", error);
  },

  async setRating(recipeId, rating) {
    const db = await supabaseServer();
    // Ratings live on bakes now (SKELETON 1.5.0): once the recipe has one, "rate
    // this recipe" means its latest bake — the same thing recipe_rating() would
    // read back — otherwise this would silently do nothing once a newer bake
    // already has its own rating. Only a recipe with no bakes at all still uses
    // the legacy column.
    const { data: latest } = await db.from("bakes").select("id").eq("recipe_id", recipeId).order("baked_on", { ascending: false }).order("created_at", { ascending: false }).limit(1).maybeSingle();
    const { error } = latest ? await db.from("bakes").update({ rating }).eq("id", latest.id) : await db.from("recipes").update({ rating }).eq("id", recipeId);
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
        rating: fields.rating,
        photo_path: fields.photoPath,
        what_changed: fields.whatChanged?.trim() || null,
        how_it_turned_out: fields.howItTurnedOut?.trim() || null,
      })
      .select("id, baked_on, scale, rating, photo_path, what_changed, how_it_turned_out, created_at")
      .single();
    if (error) return null;
    // "Use as cover" (SKELETON 1.5.0): only ever points at a bake with a photo.
    if (fields.useAsCover && fields.photoPath) await db.from("recipes").update({ cover_bake_id: data.id }).eq("id", recipeId);
    return { ...bakeFromRow(data as BakeRow), photo: await signBakePhoto(db, fields.photoPath) };
  },

  async updateBake(recipeId, entryId, fields) {
    const db = await supabaseServer();
    const { data: existing } = await db.from("bakes").select("photo_path").eq("id", entryId).eq("recipe_id", recipeId).maybeSingle();
    if (!existing) return false;
    const { data, error } = await db
      .from("bakes")
      .update({
        baked_on: fields.date,
        scale: fields.scale,
        rating: fields.rating,
        photo_path: fields.photoPath,
        what_changed: fields.whatChanged?.trim() || null,
        how_it_turned_out: fields.howItTurnedOut?.trim() || null,
      })
      .eq("id", entryId)
      .eq("recipe_id", recipeId)
      .select("id");
    if (error || (data?.length ?? 0) === 0) return false;

    // Replacing or removing this entry's photo deletes the old Storage file; if this
    // entry was the recipe's cover, the cover clears too, unless the same save also
    // asks to keep it as cover (SKELETON 1.5.0, Nathan 2026-10-15).
    const oldPath = (existing as { photo_path: string | null }).photo_path;
    const photoChanged = oldPath !== fields.photoPath;
    if (photoChanged && oldPath) await db.storage.from(BAKE_PHOTO_BUCKET).remove([oldPath]);

    if (fields.useAsCover && fields.photoPath) {
      await db.from("recipes").update({ cover_bake_id: entryId }).eq("id", recipeId);
    } else if (photoChanged) {
      // Only clears the cover when *this* entry was the one pointing to it — a
      // no-op update when some other bake is the cover.
      await db.from("recipes").update({ cover_bake_id: null }).eq("id", recipeId).eq("cover_bake_id", entryId);
    }
    return true;
  },

  async deleteBake(recipeId, entryId) {
    const db = await supabaseServer();
    // The cover clears itself via recipes_cover_bake_fkey's ON DELETE SET NULL
    // (0005) — read the photo path before the row disappears with it, so the
    // Storage file (which the FK knows nothing about) can be cleaned up too.
    const { data } = await db.from("bakes").select("photo_path").eq("id", entryId).eq("recipe_id", recipeId).maybeSingle();
    const path = (data as { photo_path: string | null } | null)?.photo_path;
    const { error } = await db.from("bakes").delete().eq("id", entryId).eq("recipe_id", recipeId);
    if (error) fail("deleting a bake", error);
    if (path) await db.storage.from(BAKE_PHOTO_BUCKET).remove([path]);
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
    await db.rpc("expire_stale_drafts");
    const { data, error } = await db.from("drafts").select(DRAFT_SELECT).order("created_at", { ascending: false });
    if (error) fail("loading drafts", error);
    return (data as unknown as DraftRow[]).map(draftFromRow);
  },

  async getDraft(id) {
    if (!UUID.test(id)) return null;
    const db = await supabaseServer();
    await db.rpc("expire_stale_drafts");
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
    return { ...draft, picture: await signThumbnail(db, draft.content?.thumbnailPath) };
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
    // A copied thumbnail has no recipe to carry it forward once its draft is gone
    // (SKELETON: "deletes it with a discarded draft or recipe") — read the path before
    // the row disappears with it.
    const { data } = await db.from("drafts").select("content").eq("id", draftId).maybeSingle();
    const path = (data?.content as { thumbnailPath?: string } | null)?.thumbnailPath;
    const { error } = await db.from("drafts").delete().eq("id", draftId);
    if (error) fail("discarding the draft", error);
    if (path) await db.storage.from(THUMBNAIL_BUCKET).remove([path]);
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
    const { data, error } = await db.rpc("import_get_caption", { p_key: key, p_draft: draftId });
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
