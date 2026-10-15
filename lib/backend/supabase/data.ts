import { toRecipeContent } from "@/lib/data/editor";
import type { DataBackend, SaveResult } from "../types";
import { RECIPE_SELECT, bakeFromRow, recipeFromRow, sharedFromRow, type BakeRow, type RecipeRow, type SharedRow } from "./map";
import { supabaseServer } from "./server";

// The Supabase backend: every query runs as the signed-in owner, and row-level
// security (supabase/migrations/0001_init.sql) limits it to their own rows. A failed
// read throws (the Error page); a failed save returns { ok: false, error: "failed" }.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fail(what: string, error: { message: string; code?: string }): never {
  throw new Error(`Supabase: ${what} failed (${error.code ?? "?"}): ${error.message}`);
}

/** Import isn't connected to Supabase yet (phase 1 keeps it behind BACKERY_FEATURE_IMPORT). */
function noImport(): never {
  throw new Error("Import isn't available with the Supabase backend yet.");
}

export const supabaseData: DataBackend = {
  async getRecipes() {
    const db = await supabaseServer();
    const { data, error } = await db.from("recipes").select(RECIPE_SELECT).order("created_at", { ascending: false });
    if (error) fail("loading recipes", error);
    return (data as unknown as RecipeRow[]).map(recipeFromRow);
  },

  async getRecipe(id) {
    if (!UUID.test(id)) return null; // not one of ours: Not found
    const db = await supabaseServer();
    const { data, error } = await db.from("recipes").select(RECIPE_SELECT).eq("id", id).maybeSingle();
    if (error) fail("loading a recipe", error);
    return data ? recipeFromRow(data as unknown as RecipeRow) : null;
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

  // Import (off in production for phase 1).
  async getDrafts() {
    return [];
  },
  async getDraft() {
    return null;
  },
  saveDraftContent: noImport,
  saveImport: noImport,
  discardDraft: noImport,
  startImport: noImport,
  retryDraft: noImport,

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
