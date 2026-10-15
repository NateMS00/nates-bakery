import { expect, test } from "@playwright/test";
import type { DataBackend } from "@/lib/backend/types";
import { handleStartImport } from "@/lib/import/server";

// lib/import/server.ts's orchestration, backend-agnostic. Uses a stub backend that —
// unlike fixtures' own importBegin — does NOT normalize the URL itself, the same as
// the real Supabase backend (which forwards it straight to a strict SQL regex). This
// is what a live reel import actually hit in production: a trailing newline in the
// Shortcut's URL reached Supabase's regex unnormalized and came back "invalid".
// Run: npx playwright test --config playwright.unit.config.ts

function stubBackend(onBegin: (url: string) => void): DataBackend {
  return {
    async importBegin(_key: string, url: string, _again: boolean) {
      onBegin(url);
      // The real SQL regex is exact-match; anything but the one clean form is invalid.
      if (url !== "https://www.instagram.com/reel/DVeTim4jtSQ/") return { status: "invalid" };
      return { status: "fetch", draftId: "d-1" };
    },
    async importSetCaption() {
      return true;
    },
    async importDrop() {
      return true;
    },
  } as unknown as DataBackend;
}

test("handleStartImport: a trailing newline in the URL no longer reaches the backend unnormalized", async () => {
  const seen: string[] = [];
  const backend = stubBackend((url) => seen.push(url));
  const fetchCaption = async () => ({ caption: "a caption", creatorHandle: "chef", thumbnailUrl: null });

  const result = await handleStartImport(backend, fetchCaption, {
    url: "https://www.instagram.com/reel/DVeTim4jtSQ/\n",
    importKey: "nbk_test",
  });

  expect(result).toEqual({ status: "started", draftId: "d-1", caption: "a caption" });
  expect(seen).toEqual(["https://www.instagram.com/reel/DVeTim4jtSQ/"]); // normalized before the backend ever saw it
});

test("handleStartImport: a link that still doesn't normalize to a reel answers invalid, no backend call", async () => {
  const seen: string[] = [];
  const backend = stubBackend((url) => seen.push(url));
  const fetchCaption = async () => ({ caption: null, creatorHandle: null, thumbnailUrl: null });

  const result = await handleStartImport(backend, fetchCaption, { url: "https://example.com/not-a-reel", importKey: "nbk_test" });

  expect(result).toEqual({ status: "invalid" });
  expect(seen).toEqual([]); // rejected before importBegin is ever called
});
