import { NextResponse, type NextRequest } from "next/server";
import { backendName, dataBackend } from "@/lib/backend";
import type { CaptionFetcher } from "@/lib/import/server";
import { handleStartImport } from "@/lib/import/server";

// docs/shortcut-guide.md step 2: the Shortcut's start-import call. POST
// {url, importKey, again?} → one of StartImportResponse's shapes (lib/data/import.ts).
// No session: the Shortcut authenticates with the owner's import key, in the body.

// The live caption fetch (lib/import/apify.ts) can take several seconds; give it room
// beyond Vercel's 10s default. fetchReel's own timeout stays a few seconds under this,
// so a slow Apify run fails as a normal, caught "unavailable" first.
export const maxDuration = 60;

async function pickFetchCaption(): Promise<CaptionFetcher> {
  if (backendName() === "fixtures") return (await import("@/lib/backend/fixtures/data")).fixturesFetchCaption;
  return (await import("@/lib/import/apify")).fetchReel;
}

// Always HTTP 200 with the status in the body, even for a malformed request — the
// Shortcut (docs/shortcut-guide.md) reads `status` from the response either way, and
// a non-200 risks Shortcuts stopping before it gets the chance to.
export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).url !== "string" || typeof (body as Record<string, unknown>).importKey !== "string") {
    return NextResponse.json({ status: "invalid", open: new URL("/import", origin).toString() });
  }
  const { url, importKey, again } = body as { url: string; importKey: string; again?: unknown };
  const backend = await dataBackend();
  const fetchCaption = await pickFetchCaption();
  // A Shortcut field mistyped as Text rather than Boolean sends the JSON string
  // "true"; accept it too, so that mistake fails loudly during testing instead of
  // silently never retrying/re-importing.
  const result = await handleStartImport(backend, fetchCaption, origin, { url, importKey, again: again === true || again === "true" });
  return NextResponse.json(result);
}
