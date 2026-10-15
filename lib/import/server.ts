import type { DataBackend } from "@/lib/backend/types";
import { normalizeReelUrl, type FailReason, type FinishImportResponse, type StartImportResponse } from "@/lib/data/import";
import { extractRecipe } from "./extract";
import { toEditorState } from "./toEditorState";

// The import API routes' logic (docs/shortcut-guide.md steps 2 and 6), backend-agnostic
// so Playwright can exercise the whole thing against fixtures by POSTing to the
// routes, the same way the real Shortcut calls them. The one backend-specific piece
// is fetching the caption itself (Apify for Supabase; a stand-in for fixtures),
// injected as `fetchCaption` rather than imported directly.

export type FetchedCaption = { caption: string | null; creatorHandle: string | null; thumbnailUrl: string | null };
export type CaptionFetcher = (url: string) => Promise<FetchedCaption>;

/** A CaptionFetcher throws this to report a specific reason instead of the generic "unavailable". */
export class ImportFetchFailure extends Error {
  reason: FailReason;
  constructor(reason: FailReason) {
    super(`import fetch failed: ${reason}`);
    this.reason = reason;
  }
}

/** `/import`, or `/import?a=b&c=d` — query values encoded by URL itself (URLSearchParams). */
function importUrl(origin: string, params?: Record<string, string>): string {
  const url = new URL("/import", origin);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  return url.toString();
}

/** `/import/<draftId>`. */
function draftUrl(origin: string, draftId: string): string {
  return new URL(`/import/${draftId}`, origin).toString();
}

export async function handleStartImport(
  backend: DataBackend,
  fetchCaption: CaptionFetcher,
  origin: string,
  body: { url: string; importKey: string; again?: boolean },
): Promise<StartImportResponse> {
  // Canonicalize before validating: the Shortcut's input can carry a trailing
  // newline, stray whitespace, or (from a real Instagram share) tracking query
  // params — none of which the Supabase backend's SQL regex tolerates on its own.
  // Fixtures' own importBegin already does this; doing it once here, for whichever
  // backend is active, closes that gap instead of duplicating it per backend.
  const url = normalizeReelUrl(body.url);
  if (!url) return { status: "invalid", open: importUrl(origin) };

  const begin = await backend.importBegin(body.importKey, url, body.again ?? false);
  switch (begin.status) {
    case "bad-key":
      return { status: "key-invalid", open: importUrl(origin, { error: "bad-key" }) };
    case "invalid":
      return { status: "invalid", open: importUrl(origin) };
    case "limit":
      return { status: "limit", open: importUrl(origin, { error: "limit", url }) };
    case "already":
      return {
        status: "already",
        recipeId: begin.recipeId,
        title: begin.title,
        open: importUrl(origin, { error: "already", recipeId: begin.recipeId, title: begin.title, url }),
      };
    case "ready":
      return { status: "ready", draftId: begin.draftId, open: draftUrl(origin, begin.draftId) };
    case "caption":
      return { status: "started", draftId: begin.draftId, caption: begin.caption };
    case "fetch":
      try {
        const fetched = await fetchCaption(url);
        await backend.importSetCaption(body.importKey, begin.draftId, fetched.caption ?? "", fetched.creatorHandle, fetched.thumbnailUrl);
        return { status: "started", draftId: begin.draftId, caption: fetched.caption ?? "" };
      } catch (err) {
        await backend.importDrop(body.importKey, begin.draftId);
        const reason = err instanceof ImportFetchFailure ? err.reason : "unavailable";
        return { status: "failed", reason, open: importUrl(origin, { error: reason, url }) };
      }
  }
}

export async function handleFinishImport(
  backend: DataBackend,
  origin: string,
  body: { draftId: string; importKey: string; reply: string },
): Promise<FinishImportResponse> {
  const draft = await backend.importGetCaption(body.importKey, body.draftId);
  if (!draft) return { status: "failed", open: draftUrl(origin, body.draftId) };

  const extracted = extractRecipe(body.reply, draft.caption);
  if (extracted.status === "no-recipe") {
    await backend.importDrop(body.importKey, body.draftId);
    return { status: "no-recipe", open: importUrl(origin, { error: "no-recipe", url: draft.reelUrl }) };
  }
  if (extracted.status === "malformed") {
    if (await backend.importMarkRetry(body.importKey, body.draftId)) return { status: "retry" };
    await backend.importUnfinished(body.importKey, body.draftId);
    return { status: "failed", open: draftUrl(origin, body.draftId) };
  }

  const { recipe } = extracted;
  const { state } = toEditorState(recipe, { reelUrl: draft.reelUrl, creatorHandle: draft.creatorHandle ?? undefined });
  const ok = await backend.importFinish(body.importKey, body.draftId, recipe.title ?? "", recipe.language ?? "English", state);
  return { status: ok ? "ready" : "failed", open: draftUrl(origin, body.draftId) };
}
