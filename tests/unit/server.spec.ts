import { expect, test } from "@playwright/test";
import type { BeginImportResult, DataBackend } from "@/lib/backend/types";
import { handleFinishImport, handleStartImport, ImportFetchFailure } from "@/lib/import/server";

// lib/import/server.ts's orchestration, backend-agnostic, and the `open` field every
// non-"started"/"retry" response carries: the full absolute URL the Shortcut should
// open and then stop, built server-side with proper encoding (docs/shortcut-guide.md).
// Run: npx playwright test --config playwright.unit.config.ts

const ORIGIN = "https://nates-bakery.vercel.app";
const REEL = "https://www.instagram.com/reel/DVeTim4jtSQ/";

/** A stub backend: only importBegin is configurable per test; the rest are no-ops
 * returning sensible defaults, since fixtures' own importBegin (unlike this stub)
 * already normalizes — this stub mirrors the real Supabase backend instead. */
function stubBackend(begin: BeginImportResult, overrides: Partial<DataBackend> = {}): DataBackend {
  return {
    async importBegin() {
      return begin;
    },
    async importSetCaption() {
      return true;
    },
    async importDrop() {
      return true;
    },
    async importGetCaption() {
      return null;
    },
    async importMarkRetry() {
      return false;
    },
    async importUnfinished() {
      return true;
    },
    async importFinish() {
      return true;
    },
    ...overrides,
  } as unknown as DataBackend;
}

const okFetch = async () => ({ caption: "a caption", creatorHandle: "chef", thumbnailUrl: null });

test("handleStartImport: a trailing newline in the URL no longer reaches the backend unnormalized", async () => {
  const seen: string[] = [];
  const backend = stubBackend(
    { status: "fetch", draftId: "d-1" },
    {
      importBegin: async (_key, url) => {
        seen.push(url);
        return { status: "fetch", draftId: "d-1" };
      },
    },
  );
  const result = await handleStartImport(backend, okFetch, ORIGIN, { url: `${REEL}\n`, importKey: "nbk_test" });
  expect(result).toEqual({ status: "started", draftId: "d-1", caption: "a caption" }); // "started" carries no "open"
  expect(seen).toEqual([REEL]); // normalized before the backend ever saw it
});

test("handleStartImport: a link that doesn't normalize to a reel answers invalid, no backend call", async () => {
  let called = false;
  const backend = stubBackend(
    { status: "invalid" },
    {
      importBegin: async () => {
        called = true;
        return { status: "invalid" };
      },
    },
  );
  const result = await handleStartImport(backend, okFetch, ORIGIN, { url: "https://example.com/not-a-reel", importKey: "nbk_test" });
  expect(result).toEqual({ status: "invalid", open: `${ORIGIN}/import` });
  expect(called).toBe(false); // rejected before importBegin is ever called
});

test("handleStartImport: open for every status but started", async () => {
  const cases: [BeginImportResult, Awaited<ReturnType<typeof handleStartImport>>][] = [
    [{ status: "bad-key" }, { status: "key-invalid", open: `${ORIGIN}/import?error=bad-key` }],
    [{ status: "invalid" }, { status: "invalid", open: `${ORIGIN}/import` }],
    [{ status: "limit" }, { status: "limit", open: `${ORIGIN}/import?error=limit&url=${encodeURIComponent(REEL)}` }],
    [{ status: "ready", draftId: "d-9" }, { status: "ready", draftId: "d-9", open: `${ORIGIN}/import/d-9` }],
  ];
  for (const [begin, expected] of cases) {
    const result = await handleStartImport(stubBackend(begin), okFetch, ORIGIN, { url: REEL, importKey: "k" });
    expect(result, begin.status).toEqual(expected);
  }
});

test("handleStartImport: already — title and the reel URL are properly encoded, not just concatenated", async () => {
  const begin: BeginImportResult = { status: "already", recipeId: "r-1", title: "Pastéis de nata & friends" };
  const result = await handleStartImport(stubBackend(begin), okFetch, ORIGIN, { url: REEL, importKey: "k" });
  const open = new URL(`${ORIGIN}/import`);
  open.searchParams.set("error", "already");
  open.searchParams.set("recipeId", "r-1");
  open.searchParams.set("title", "Pastéis de nata & friends");
  open.searchParams.set("url", REEL);
  expect(result).toEqual({ status: "already", recipeId: "r-1", title: "Pastéis de nata & friends", open: open.toString() });
  // Built with URLSearchParams, not string concatenation: the space becomes "+", the
  // "&" is escaped to "%26" rather than starting a new query parameter, and "é" is
  // percent-encoded — every one of which a naive template string would get wrong.
  expect(result).toMatchObject({ open: expect.stringContaining("title=Past%C3%A9is+de+nata+%26+friends") });
});

test("handleStartImport: a fetch failure's reason lands in both the status and the open URL", async () => {
  const failFetch = async () => {
    throw new ImportFetchFailure("private");
  };
  const result = await handleStartImport(stubBackend({ status: "fetch", draftId: "d-2" }), failFetch, ORIGIN, { url: REEL, importKey: "k" });
  expect(result).toEqual({ status: "failed", reason: "private", open: `${ORIGIN}/import?error=private&url=${encodeURIComponent(REEL)}` });
});

test("handleFinishImport: open for every status but retry", async () => {
  const draft = { caption: "cap", creatorHandle: "chef", reelUrl: REEL };

  const ready = await handleFinishImport(
    stubBackend({ status: "invalid" }, { importGetCaption: async () => draft, importFinish: async () => true }),
    ORIGIN,
    { draftId: "d-3", importKey: "k", reply: JSON.stringify({ language: "English", title: "T", category: null, yield: null, totalTime: null, ingredientGroups: [], stepGroups: [] }) },
  );
  expect(ready).toEqual({ status: "ready", open: `${ORIGIN}/import/d-3` });

  const noRecipe = await handleFinishImport(
    stubBackend({ status: "invalid" }, { importGetCaption: async () => draft }),
    ORIGIN,
    { draftId: "d-4", importKey: "k", reply: JSON.stringify({ recipe: false }) },
  );
  expect(noRecipe).toEqual({ status: "no-recipe", open: `${ORIGIN}/import?error=no-recipe&url=${encodeURIComponent(REEL)}` });

  const failedMalformed = await handleFinishImport(
    stubBackend({ status: "invalid" }, { importGetCaption: async () => draft, importMarkRetry: async () => false }),
    ORIGIN,
    { draftId: "d-5", importKey: "k", reply: "not json" },
  );
  expect(failedMalformed).toEqual({ status: "failed", open: `${ORIGIN}/import/d-5` });

  const failedGone = await handleFinishImport(stubBackend({ status: "invalid" }, { importGetCaption: async () => null }), ORIGIN, {
    draftId: "d-6",
    importKey: "k",
    reply: "anything",
  });
  expect(failedGone).toEqual({ status: "failed", open: `${ORIGIN}/import/d-6` });
});

test("handleFinishImport: retry carries no open — the Shortcut isn't meant to stop here", async () => {
  const draft = { caption: "cap", creatorHandle: null, reelUrl: REEL };
  const result = await handleFinishImport(
    stubBackend({ status: "invalid" }, { importGetCaption: async () => draft, importMarkRetry: async () => true }),
    ORIGIN,
    { draftId: "d-7", importKey: "k", reply: "not json" },
  );
  expect(result).toEqual({ status: "retry" });
});
